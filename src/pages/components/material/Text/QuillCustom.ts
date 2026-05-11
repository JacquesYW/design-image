import { DESIGNCANVASID } from '@/common/config';
import { fontList } from '@/pages/design/RightBar/MaterialEditPanel/TextPanel/fonts';
import { Listener } from '@/utils/utils';
import Attributor from 'parchment/dist/src/attributor/attributor';
import Quill from 'quill';
import Delta from 'quill-delta';
import Emitter, { EmitterSource } from 'quill/core/emitter';
import { Range } from 'quill/core/selection';

const SizeStyle = Quill.import('attributors/style/size') as Attributor;
const FontStyle = Quill.import('attributors/style/font') as Attributor;
const ColorStyle = Quill.import('attributors/style/color') as Attributor;
// console.log(Quill.imports);
ColorStyle.add = function (node: HTMLElement, value: string) {
  if (!this.canAdd(node, value)) {
    return false;
  }
  if (node.style) {
    node.style.color = value;
    node.style.setProperty('--color', value);
  }
  return true;
};
SizeStyle.whitelist = undefined;
FontStyle.whitelist = fontList.map((item) => item.value);
Quill.register(SizeStyle, true);
Quill.register(FontStyle, true);
Quill.register(ColorStyle, true);
type TextChangeHandler = (delta: Delta, oldContent: Delta, source: EmitterSource) => void;
type SelectionChangeHandler = (range: Range, oldRange: Range, source: EmitterSource) => void;
type EditorChangeHandler = (
  ...args:
    | [(typeof Emitter)['events']['TEXT_CHANGE'], Delta, Delta, EmitterSource]
    | [(typeof Emitter)['events']['SELECTION_CHANGE'], Range, Range, EmitterSource]
) => void;
type Handler = {
  'text-change': TextChangeHandler;
  'selection-change': SelectionChangeHandler;
  'editor-change': EditorChangeHandler;
};
class QuillCustom extends Quill {
  private events = new Map<string, PickByValue<Handler, keyof Handler>>();
  private listener = null as null | Listener<HTMLElement>;
  container: HTMLElement;
  constructor(container: HTMLElement | string, options?: ConstructorParameters<typeof Quill>[1]) {
    super(container, {
      ...options,
      modules: {
        ...options?.modules,
        keyboard: {
          container,
          bindings: {
            tab: {
              key: 9,
              handler: function () {
                return false;
              },
            },
          },
        },
      },
    });
    this.listener = new Listener(this.root);
    if (typeof container == 'string') {
      this.container = document.getElementById(container) as HTMLElement;
    } else {
      this.container = container as HTMLElement;
    }
    // 避免quill的公共事件影响整个页面 - node:body => dom:id=DESIGNCANVASID
    type Emitter = {
      listeners: {
        [key: string]: Array<{ node: Element | null }>;
      };
    };
    const listeners = (this as unknown as { emitter: Emitter }).emitter.listeners;
    Object.values(listeners).forEach((item) => {
      item.forEach((listen) => {
        listen.node = document.getElementById(DESIGNCANVASID);
      });
    });
    this.enable(false);
    /* 
      避免和整体的图层的copy,cut,paste事件冲突
    */
    this.listener.on('copy', (e) => {
      e.stopPropagation();
    });
    this.listener.on('cut', (e) => {
      e.stopPropagation();
    });
    this.listener.on('paste', async (e) => {
      e.stopPropagation();
    });
    /* 
      禁止文本拖拽文字变更
      原因: 拖拽文字变更, 会携带父级背景色
    */
    this.listener.on('dragover', function (event) {
      event.preventDefault();
    });
    this.listener.on('drop', function (event) {
      event.preventDefault();
    });
    /* 
      避免失焦后,文本的选中状态消失
    */
    this.listener.on('blur', () => {
      const range = this.getSelection();
      if (range) {
        if (range.length > 0) {
          this.setSelection(range.index, range.length);
        }
      }
    });
    this.addEventListener('editor-change', () => {
      if (!this.isEnabled()) {
        this.setDataText();
      }
    });
  }
  getTextNodes(node: ChildNode | null | undefined): Node[] {
    let all: Node[] = [];
    for (node = node?.firstChild; node; node = node.nextSibling) {
      if (node.nodeType === 3) all.push(node);
      else all = all.concat(this.getTextNodes(node));
    }
    return all;
  }
  setDataText() {
    const textList = this.getTextNodes(this.root);
    [...textList].map((dom) => {
      /* 
        特殊处理-每个子节点必定会有style(color,size,font)
        quill在有style属性的节点,会加到叶子节点,
        当渲染叶子节点时, 证明已经处理完所有逻辑,
        这时候,加上data-text属性, 就可以避免和quill最dom元素的操作过程中,出现死循环
        *** 这边不做延迟执行的原因: 会在操作时,出现属性未添加,造成描边和填充颜色短暂失效的情况
      */
      // if (dom.parentElement && dom.parentElement.hasAttribute('style')) {
      //   dom.parentElement?.setAttribute('data-text', dom.textContent || '');
      // }
      if (dom.parentElement) {
        dom.parentElement?.setAttribute('data-text', dom.textContent || '');
      }
    });
  }
  setContents(delta: Delta, source?: EmitterSource | undefined) {
    const range = this.getSelection();
    const newDelta = super.setContents(delta, source);
    if (range) {
      if (range.length > 0) {
        this.setSelection(range.index, range.length);
      }
    }
    return newDelta;
  }
  getSelection(focus = false, isUpdate = true) {
    if (focus) this.focus();
    /* 
      不走update,容易造成死循环(在回调里面用getSelection)
      这边手动获取新的range或上一次range
    */
    // Make sure we access getRange with editor in consistent state
    // this.update();
    if (isUpdate) {
      return this.selection.getRange()[0] as Range;
    } else {
      return this.selection.lastRange as Range;
    }
  }
  addEventListener(eventName: 'text-change', handler: TextChangeHandler): void;
  addEventListener(eventName: 'selection-change', handler: SelectionChangeHandler): void;
  addEventListener(eventName: 'editor-change', handler: EditorChangeHandler): void;
  addEventListener(eventName: keyof Handler, handler: PickByValue<Handler, keyof Handler>) {
    this.events.set(eventName, handler);
    if (eventName == 'text-change') {
      this.on(eventName, handler as PickByValue<Handler, typeof eventName>);
    }
    if (eventName == 'selection-change') {
      this.on(eventName, handler as PickByValue<Handler, typeof eventName>);
    }
    if (eventName == 'editor-change') {
      this.on(eventName, handler as PickByValue<Handler, typeof eventName>);
    }
  }
  removeEventListener(eventName: keyof Handler) {
    if (this.events.get(eventName)) {
      if (eventName == 'text-change') {
        this.off(eventName, this.events.get(eventName) as PickByValue<Handler, typeof eventName>);
      }
      if (eventName == 'selection-change') {
        this.off(eventName, this.events.get(eventName) as PickByValue<Handler, typeof eventName>);
      }
      if (eventName == 'editor-change') {
        this.off(
          eventName,
          this.events.get(eventName) as unknown as (...args: ['selection-change', Delta, Delta, EmitterSource]) => void,
        );
      }
    }
  }
  destroy() {
    [...this.events].forEach(([key]) => {
      this.removeEventListener(key as keyof Handler);
    });
    this.listener?.destroy();
  }
}
export default QuillCustom;

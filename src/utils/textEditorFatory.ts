import QuillCustom from '@/pages/components/material/Text/QuillCustom';
import manageFactory from './manageFactory';
import { EmitterSource } from 'quill/core/emitter';

class TextEditorFatory {
  private quills = new Map<string, QuillCustom>();
  private events = new Map<string, (type?: string) => void>();
  private nextId = '';
  private isInit = false;
  preId = '';
  quill: QuillCustom | undefined;
  onChange = null as ((format: Record<string, unknown>, isInit?: boolean) => void) | null;
  constructor() {
    this.quill = undefined;
  }
  updateToolBar = () => {
    if (this.quill) {
      // 取最近一次的selection的内容
      const format = this.getFormat(false);
      this.onChange && this.onChange(format, this.isInit);
      if (this.isInit) this.isInit = false;
    }
  };
  off() {
    if (this.quill) {
      this.quill.off('editor-change', this.updateToolBar);
    }
  }
  useQuill(id: string) {
    if (id) {
      this.quill = this.quills.get(id);
      if (this.quill) {
        window.quill = this.quill;
        this.off();
        this.preId = id;
        this.nextId = '';
        this.isInit = true;
        this.updateToolBar();
        this.quill.on('editor-change', this.updateToolBar);
      } else {
        this.nextId = id;
      }
    }
  }
  registerQuill(id: string, quill: QuillCustom) {
    this.quills.set(id, quill);
    if (this.preId === id) {
      this.quill = quill;
    }
    if (this.nextId) {
      this.useQuill(this.nextId);
    }
  }
  registerEvents(id: string, callback: (type?: string) => void) {
    this.events.set(id, callback);
  }
  dispatchEvents(type?: string) {
    const fn = this.events.get(this.preId);
    fn && fn(type);
  }
  hasQuill(id: string) {
    return this.quills.has(id);
  }
  removeQuill(id: string) {
    this.quills.delete(id);
    this.events.delete(id);
    if (this.preId == id) {
      this.quill = undefined;
    }
  }
  isSelection() {
    if (this.quill) {
      const range = this.quill.getSelection();
      const allLen = this.quill.getLength();
      const len = range?.length || 0;
      return len > 0 && len < allLen - 1;
    }
    return false;
  }
  /* 
    单选中时(默认编辑所有文字的状态)
    只选中文本图层时isEnabled: 是false
    只有双击编辑时,isEnabled才是true
  */
  getFormat(isLast = true) {
    if (this.quill) {
      const range = this.quill.getSelection(false, isLast);
      if (!this.quill.isEnabled() || !range) {
        return this.quill.getFormat(0, this.quill.getLength());
      } else {
        return this.quill.getFormat(range.index, range.length);
      }
    }
    return {};
  }
  setFormat(key: string, value: unknown, source?: EmitterSource) {
    if (this.quill) {
      const range = this.quill.getSelection();
      if (!this.quill.isEnabled() || !range || range.length <= 0) {
        this.quill.formatText({ index: 0, length: this.quill.getLength() }, key, value, source);
      } else {
        this.quill.formatText(range, key, value, source);
      }
      if (source != 'silent') {
        if (manageFactory.hasRegister(this.preId, 'sync')) {
          manageFactory.dispatchRegister(this.preId, 'sync', {});
        }
      }
    }
  }
  // 是否只是选中图层(并没有编辑局部文字)- 更新逻辑不一致
  isEditAll() {
    return this.quill?.isEnabled() === false;
  }
  getBold(): boolean | undefined {
    return this.getFormat().bold as boolean;
  }
  setBold(value: boolean) {
    if (this.quill) {
      this.setFormat('bold', value);
    }
  }
  getItalic(): boolean | undefined {
    return this.getFormat().italic as boolean;
  }
  setItalic(value: boolean) {
    if (this.quill) {
      this.setFormat('italic', value);
    }
  }
  getUnderline(): boolean | undefined {
    return this.getFormat().underline as boolean;
  }
  setUnderline(value: boolean) {
    if (this.quill) {
      if (value) {
        this.setFormat('strike', false, 'silent');
      }
      this.setFormat('underline', value);
    }
  }
  getStrike(): boolean | undefined {
    return this.getFormat().strike as boolean;
  }
  setStrike(value: boolean) {
    if (this.quill) {
      if (value) {
        this.setFormat('underline', false, 'silent');
      }
      this.setFormat('strike', value);
    }
  }
  getColor(): string | undefined {
    return this.getFormat().color as string;
  }
  setColor(value: string) {
    if (this.quill) {
      this.setFormat('color', value);
    }
  }
  /* ordered / bullet */
  getOrdered(): boolean | undefined {
    return this.getFormat().list == 'ordered';
  }
  getBullet(): boolean | undefined {
    return this.getFormat().list == 'bullet';
  }
  setList(value?: 'ordered' | 'bullet') {
    if (this.quill) {
      this.quill.formatLine(0, this.quill.getLength() || 0, 'list', value || '');
    }
  }
}

export default new TextEditorFatory();

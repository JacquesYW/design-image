import _ from 'lodash';
import { DESIGNCANVASCONTAINER } from '@/common/config';
import { Layer } from '@/pages/design/interface';
import { getElementInfo } from 'moveable';
import { singletonClass } from './singletonClass';

/* 
  管理工厂
  1. id和dom的双向映射管理
  2. id和碰撞函数的映射管理
  ----------------------
  碰撞函数运行逻辑
*/
export type ManageElement = HTMLElement | SVGElement;
/* x == clientX  y == clientY */
type HintFnParam = { x: number; y: number };
type HintFn = (e: HintFnParam, dom?: ManageElement) => 0 | 1 | 2;
class ManageFactory {
  private domById = new Map<string, ManageElement>();
  private idByDom = new WeakMap<ManageElement, string>();
  private transdomById = new Map<string, ManageElement>();
  private hintFnById = new Map<string, HintFn>();
  private pathById = new Map<string, string>();
  private layerDataById = new Map<string, Layer>();
  private snappableById = new Map<string, boolean>();
  private moveableDriectionsById = new Map<string, string[]>();
  /* group组下面的id集合 */
  private idBySubId = new Map<string, string>();
  /* group组id和子集id的映射 */
  private subIdsById = new Map<string, string[]>();
  private registerEvent = new Map<string, Map<string, <T>(param: T, id: string, eventType: string) => void>>();
  protected preHoverId = '';
  protected hoverDom = null as HTMLElement | null;
  constructor() {}
  /* 注册 - 一个事件绑定一个函数 */
  register(id: string, eventType: string, fn: (param: unknown, id: string, eventType: string) => void) {
    if (!this.registerEvent.has(id)) {
      this.registerEvent.set(id, new Map());
    }
    this.registerEvent.get(id)?.set(eventType, fn);
  }
  /* 调用 */
  dispatchRegister<T>(id: string, eventType: string, param?: T) {
    const fn = this.registerEvent.get(id)?.get(eventType);
    if (fn) {
      fn(param, id, eventType);
    }
  }
  // 检测-是否绑定了对应函数
  hasRegister(id: string, eventType: string) {
    return this.registerEvent.has(id) && this.registerEvent.get(id)?.has(eventType);
  }
  /* 
    拖拽方向管理
  */
  setMoveableDriectionsById(id: string, driections: string[]) {
    this.moveableDriectionsById.set(id, driections);
  }
  getMoveableDriectionsById(id: string) {
    return this.moveableDriectionsById.get(id) as string[];
  }
  getMoveableDriectionsByIds(ids: string[]) {
    return _.intersection(
      ...(ids.map(
        (id) => this.moveableDriectionsById.get(id) || ['n', 'nw', 'ne', 's', 'se', 'sw', 'e', 'w'],
      ) as string[][]),
    );
  }
  /* 
    辅助线管理
  */
  setSnappableById(id: string, snappable: boolean) {
    this.snappableById.set(id, snappable);
  }
  getSnappableById(id: string) {
    return this.snappableById.get(id);
  }
  getSnappableByIds(ids: string[]) {
    /* 没注册的按true处理 */
    return ids.every((id) => !this.snappableById.has(id) || this.snappableById.get(id));
  }
  /* 
    图层数据路径和id的管理映射
  */
  setPathById(id: string, path: string) {
    if (this.isGroupId(id)) {
      /* 替换所有子图层的path数据 */
      const oldPath = this.getPathById(id);
      this.getAllSubIdsById(id, true).forEach((subId) => {
        this.setPathById(subId, this.getPathById(subId).replace(oldPath, path));
      });
    }
    this.pathById.set(id, path);
  }
  getPathById(id: string) {
    return this.pathById.get(id) as string;
  }
  getPathsByIds(ids: string[]) {
    return ids.map((id) => this.getPathById(id)) as string[];
  }
  /* 
    图层数据和id的管理映射
  */
  setLayerDataById(id: string, layerData: Layer) {
    this.layerDataById.set(id, layerData);
  }
  getLayerDataById(id: string) {
    return this.layerDataById.get(id);
  }
  getLayerDatasByIds(ids: string[]) {
    return ids.map((id) => this.getLayerDataById(id));
  }
  getLayerTypeById(id: string) {
    return this.layerDataById.get(id)?.ty;
  }
  /* 
    图层dom和id的管理映射
  */
  setDomById(id: string, dom: ManageElement) {
    this.domById.set(id, dom);
    this.idByDom.set(dom, id);
  }
  getDomById(id: string) {
    return this.domById.get(id) as ManageElement;
  }
  getDomsByIds(ids: string[]) {
    return ids.map((id) => this.domById.get(id)).filter((dom) => !!dom) as ManageElement[];
  }
  getDomIds() {
    return [...this.domById.keys()];
  }
  hasId(id: string) {
    return this.domById.has(id);
  }
  getDoms() {
    return [...this.domById.values()];
  }
  getIdByDom(dom: ManageElement) {
    return this.idByDom.get(dom) as string;
  }
  getIdsByDoms(doms: ManageElement[]) {
    return doms.map((dom) => this.idByDom.get(dom)) as string[];
  }
  /* 
    外层盒子div的dom和id的管理映射
  */
  setTransDomById(id: string, dom: ManageElement) {
    this.transdomById.set(id, dom);
    this.idByDom.set(dom, id);
  }
  getTransDomById(id: string) {
    return this.transdomById.get(id) as ManageElement;
  }
  getTransDomsByIds(ids: string[]) {
    return ids.map((id) => this.transdomById.get(id)).filter((dom) => !!dom) as ManageElement[];
  }
  getIdByTransDom(dom: ManageElement) {
    return this.getIdByDom(dom) as string;
  }
  getIdsByTransDoms(doms: ManageElement[]) {
    return this.getIdsByDoms(doms);
  }
  getIds() {
    return [...this.transdomById.keys()];
  }
  /* 
    组图层和子图层id的管理映射
  */
  setSubIdsById(id: string, subIds: string[]) {
    this.subIdsById.set(id, subIds);
    subIds.forEach((subId) => {
      this.idBySubId.set(subId, id);
    });
  }
  isSubId(id: string) {
    return this.idBySubId.has(id);
  }
  isGroupId(id: string) {
    return this.subIdsById.has(id);
  }
  getSubIdsById(id: string) {
    return this.subIdsById.get(id) as string[];
  }
  getIdBySubId(subId: string) {
    return this.idBySubId.get(subId) as string;
  }
  /* 非递归的, 优点, 不容易栈溢出, 缺点, 子图层的顺序需要处理下 */
  // getAllSubIdsById(id: string, hasGroupId: boolean = false) {
  //   if (!id) return [];
  //   if (!this.isGroupId(id)) return [id];
  //   const ids = new Set<string>();
  //   const gids: string[] = [];
  //   const dealSubIds = (gid: string) => {
  //     if (!gid) return;
  //     this.getSubIdsById(gid).forEach((id) => {
  //       if (this.isGroupId(id)) {
  //         gids.push(id);
  //       } else {
  //         ids.add(id);
  //       }
  //     });
  //   };
  //   dealSubIds(id);
  //   let i = 0;
  //   while (i <= gids.length) {
  //     dealSubIds(gids[i++]);
  //   }
  //   if (hasGroupId) {
  //     return [...new Set(gids), ...ids];
  //   }
  //   return [...ids];
  // }
  /* 递归处理 - 好处, id的顺序方便处理 */
  getAllSubIdsById(id: string, hasGroupId: boolean = false) {
    if (!id) return [];
    if (!this.isGroupId(id)) return [id];
    const ids = new Set<string>();
    const dealSubIds = (gid: string) => {
      if (!gid) return;
      this.getSubIdsById(gid).forEach((id) => {
        if (this.isGroupId(id)) {
          if (hasGroupId) {
            ids.add(id);
          }
          dealSubIds(id);
        } else {
          ids.add(id);
        }
      });
    };
    dealSubIds(id);
    return [...ids];
  }
  getAllsubIdsByIds(ids: string[], hasGroupId: boolean = false) {
    return [...new Set(ids.map((id) => [id, ...this.getAllSubIdsById(id, hasGroupId)]).flat())];
  }
  getHighestIdBySubId(subId: string | null) {
    if (!subId) return '';
    let id = subId;
    while (this.isSubId(id)) {
      id = this.getIdBySubId(id);
    }
    return id;
  }
  /* 
    图层锁定管理
  */
  getLockedCacheById(id: string) {
    return this.layerDataById.get(id)?.isLocked;
  }
  isLockedById(id: string) {
    // 子图层, 使用父图层的锁数据判断
    if (this.isSubId(id)) {
      return this.layerDataById.get(this.idBySubId.get(id) as string)?.isLocked;
    } else {
      return this.layerDataById.get(id)?.isLocked;
    }
  }
  isLockedByIds(ids: string[]) {
    return ids.every((id) => this.isLockedById(id));
  }
  /* 
    各图层碰撞函数管理
  */
  setHintFnById(id: string, fn: HintFn) {
    this.hintFnById.set(id, fn);
  }
  getHintFnById(id: string) {
    return this.hintFnById.get(id) as HintFn;
  }
  getHintFnsByIds(ids: string[]) {
    return ids.map((id) => this.hintFnById.get(id)) as HintFn[];
  }
  /* 
    获取鼠标碰撞到的id
    0: 未碰撞
    1: 碰撞
    2: 特殊碰撞 (如图片: 透明穿透功能)
  */
  getHintIdByEvent(e: HintFnParam, ids: string[]) {
    // 返回的id
    let rId = '',
      // 验证状态是2的id - 在没有1的id时,返回2的id
      id_2 = '';
    const isGet = ids.some((id) => {
      const hintFn = this.hintFnById.get(id);
      if (hintFn) {
        const status = hintFn(e);
        if (status == 1) {
          rId = id;
          return true;
        }
        if (!id_2 && status == 2) {
          id_2 = id;
        }
        return false;
      }
    });
    return isGet ? rId : id_2;
  }
  /* 注销 */
  removeById(id: string) {
    this.domById.delete(id);
    this.transdomById.delete(id);
    this.hintFnById.delete(id);
    this.pathById.delete(id);
    this.layerDataById.delete(id);
    this.snappableById.delete(id);
    this.moveableDriectionsById.delete(id);
    this.idBySubId.delete(id);
    this.subIdsById.delete(id);
    this.registerEvent.get(id)?.clear();
    this.registerEvent.delete(id);
  }
  clear() {
    this.domById.clear();
    this.transdomById.clear();
    this.hintFnById.clear();
    this.pathById.clear();
    this.layerDataById.clear();
    this.snappableById.clear();
    this.moveableDriectionsById.clear();
    this.idBySubId.clear();
    this.subIdsById.clear();
    this.preHoverId = '';
    [...this.registerEvent].forEach((maps) => {
      maps[1]?.clear();
    });
    this.registerEvent.clear();
    this.hoverDom = null;
  }
  /* 功能 */
  toggleHoverById(id: string) {
    // 避免move事件重复无用触发
    if ((this.preHoverId && id != this.preHoverId) || (!this.preHoverId && id)) {
      this.clearAllHover();
      const dom = this.transdomById.get(id);
      if (dom) {
        this.preHoverId = id;
        this.toggleHoverDom(dom as HTMLElement);
      }
    }
  }
  clearAllHover() {
    this.toggleHoverDom();
    this.preHoverId = '';
  }
  renderHoverDom() {
    // 未创建dom || 真实dom被删除
    if (!this.hoverDom || !this.hoverDom.isConnected) {
      this.hoverDom = document.createElement('div');
      this.hoverDom.style.position = 'absolute';
      this.hoverDom.style.top = '0px';
      this.hoverDom.style.left = '0px';
      this.hoverDom.style.pointerEvents = 'none';
      this.hoverDom.style.border = '2px dashed var(--color-blue-600)';
      this.hoverDom.style.boxSizing = 'border-box';
      this.hoverDom.style.visibility = 'hidden';
      this.hoverDom.style.zIndex = '2000';
      document.getElementById(DESIGNCANVASCONTAINER)?.append(this.hoverDom);
    }
  }
  toggleHoverDom(dom?: HTMLElement) {
    this.renderHoverDom();
    if (this.hoverDom) {
      if (dom) {
        const { width, height, targetMatrix } = getElementInfo(dom);
        targetMatrix[12] -= 1;
        targetMatrix[13] -= 1;
        // 宽度增大2px (边框的宽度)
        this.hoverDom.style.width = `${width + 2}px`;
        this.hoverDom.style.height = `${height + 2}px`;
        // 偏移1px (边框的宽度)
        this.hoverDom.style.transform = `matrix3d(${targetMatrix.join(',')})`;
        this.hoverDom.style.visibility = 'visible';
      } else {
        this.hoverDom.style.visibility = 'hidden';
        this.hoverDom.style.width = '0px';
        this.hoverDom.style.height = '0px';
        this.hoverDom.style.transform = 'translate(0px, 0px)';
      }
    }
  }
}

const SingleFactory = singletonClass(ManageFactory);
export default new SingleFactory();

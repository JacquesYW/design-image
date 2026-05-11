import gsap from 'gsap';
import { AnimationUpdateCallback, LayerAnimation, MainLayer } from '../../interface';
import AnimationItem from './AnimationItem';
import AnimationManager from './AnimationManager';

export default class AnimationGroup {
  public id: string;
  private items: AnimationItem[] = [];
  private timeline: gsap.core.Timeline | null;
  private localPreviewTimeline: gsap.core.Timeline | null = null;
  // private layerData: MainLayer | null = null;
  private layerState: object | null = null;
  private localPreviewLayerState: object | null = null;
  private updateCallback: AnimationUpdateCallback | null = null;
  private previewType: 'group' | 'item' | null = null;
  private previewingItem: AnimationItem | null = null;
  private manager: AnimationManager;

  constructor(
    manager: AnimationManager,
    id: string,
    timeline: gsap.core.Timeline,
    updateCallback: AnimationUpdateCallback,
  ) {
    this.manager = manager;
    this.id = id;
    this.timeline = timeline;
    this.updateCallback = updateCallback;
    this.layerState = {};
  }
  ensureTimeline() {
    if (!this.localPreviewTimeline) {
      this.localPreviewTimeline = gsap.timeline({
        paused: true,
        immediateRender: false,
        onStart: () => {
          this.onTimeLinePreviewStart();
        },
        onUpdate: () => {
          this.onTimeLinePreviewUpdate();
        },
        onComplete: () => {
          this.onTimeLinePreviewComplete();
        },
      });
    }
  }
  getGroupPreviewTimeline() {
    return this.localPreviewTimeline;
  }
  initLocalPreviewLayerState() {
    this.localPreviewLayerState = {};
  }
  onTimeLinePreviewStart() {}
  onTimeLinePreviewUpdate() {
    if (this.updateCallback && this.localPreviewLayerState) {
      this.updateCallback(this.localPreviewLayerState);
    }
  }
  onTimeLinePreviewComplete() {
    this.localPreviewLayerState = {};
    if (this.previewType === 'group') {
      if (this.localPreviewTimeline) {
        this.localPreviewTimeline.pause(0);
      }
      this.stopPreviewGroupSelf();
    }
  }

  getGroupPreveiewLayerState() {
    return this.localPreviewLayerState;
  }

  count() {
    return this.items.reduce((count, item) => {
      if (item && item.available) {
        return count + 1;
      }
      return count;
    }, 0);
  }

  onTweenChange() {
    this.manager.onTweenChange();
  }

  onTweenStart() {
    this.layerState = {};
    // this.tweenStates[idx] = 'playing';
  }
  onTweenUpdate() {
    if (this.updateCallback && this.layerState) {
      this.updateCallback(this.layerState);
    }
  }
  onTweenComplete() {}

  getLayerState() {
    return this.layerState;
  }

  update(layer: MainLayer) {
    const animationDatas = layer.anm || [];
    let changed = false;
    animationDatas.forEach((animationData, index) => {
      const animationItem = this.items[index];
      if (animationItem) {
        const res = animationItem.update(layer, animationData);
        if (res === true) {
          changed = true;
        }
      } else {
        this._add(layer, animationData, index);
        changed = true;
      }
    });
    const restCount = this.items.length - animationDatas.length;
    if (restCount > 0) {
      for (let i = 0; i < restCount; i++) {
        this._remove(this.items.length - 1 - i);
        changed = true;
      }
    }
    if (changed) {
      this.manager.stopPreview();
      this.layerState = {};
      this.onTweenChange();
    }
  }

  _add(layer: MainLayer, animationData: LayerAnimation, idx: number) {
    const item = new AnimationItem(this, this.timeline!, this.updateCallback!);
    this.items[idx] = item;
    item.update(layer, animationData);
    return item;
  }

  remove(idx: number) {
    this._remove(idx);
    this.onTweenChange();
  }
  _remove(idx: number) {
    const item = this.items[idx];
    this.items.splice(idx, 1);
    if (item) {
      item.destroy();
    }
  }

  startPreviewGroup() {
    if (this.previewType === 'group') {
      this._stopPreview();
      return;
    }
    this.initLocalPreviewLayerState();
    this.ensureTimeline();
    this.items.forEach((item) => {
      item.initGroupPreviewItem();
    });
    this.previewType = 'group';

    this.localPreviewTimeline!.play(0, true);
  }
  startPreviewItem(idx: number) {
    const item = this.items[idx];
    if (!item) {
      return null;
    }
    if (this.previewType === 'item') {
      if (item === this.previewingItem) {
        return;
      }
      this.stopPreviewItem();
    }
    this.previewType = 'item';
    this.previewingItem = item;
    item.startPreview();
    return item;
  }
  _stopPreview() {
    if (this.previewType === 'item') {
      this.stopPreviewItem();
    } else if (this.previewType === 'group') {
      this.stopPreviewGroup();
    }
    this.previewType = null;
  }
  stopPreviewGroup() {
    if (this.previewType !== 'group') {
      return;
    }
    if (this.localPreviewTimeline) {
      this.localPreviewTimeline.pause(0, false);
    }
    this.stopPreviewGroupSelf();
  }
  stopPreviewGroupSelf() {
    this.previewType = null;
    this.manager.stopPreviewGroupBySelf();
    this.clearPreviewAffect();
  }
  stopPreviewItem() {
    if (this.previewType !== 'item') {
      return;
    }
    this.previewingItem!.stopPreview();
    this.previewType = null;
    this.previewingItem = null;
  }

  stopPreviewItemBySelf() {
    this.previewType = null;
    this.previewingItem = null;
    this.manager.stopPreviewItemBySelf();
  }

  clearPreviewAffect() {
    if (this.localPreviewTimeline) {
      this.localPreviewTimeline.kill();
    }
    this.items.forEach((item) => {
      item.clearPreviewAffect();
    });
  }

  clear() {
    this.items.forEach((item) => item.destroy());
    this.items.length = 0;
  }

  getTimeInfo() {
    const maxDuration = this.items.reduce((maxDuration, item) => {
      if (!item || !item.available) {
        return maxDuration;
      }
      const itemTimeInfo = item.getTimeInfo();
      if (!itemTimeInfo) {
        return maxDuration;
      }
      const totalDuration = itemTimeInfo.delay + itemTimeInfo.duration;
      return totalDuration > maxDuration ? totalDuration : maxDuration;
    }, 0);
    return {
      duration: maxDuration,
    };
  }

  destroy() {
    this.clear();
    this.timeline = null;
    // this.layerData = null;
    this.updateCallback = null;
  }
}

import { isEqual } from 'lodash';
import { AnimationSchema, AnimationUpdateCallback, LayerAnimation, MainLayer } from '../../interface';
import AnimationGroup from './AnimationGroup';
import AnimationTween from './AnimationTween';
import { getAnimationSchema } from '../schemaManager';
import gsap from 'gsap';

export default class AnimationItem {
  private timeline: gsap.core.Timeline | null;
  private localTimeline: gsap.core.Timeline | null = null;
  private localPreviewTimeline: gsap.core.Timeline | null = null;
  private tweens: AnimationTween[] = [];
  private options: LayerAnimation | null = null;
  private schema: AnimationSchema | null = null;
  private layerData: MainLayer | null = null;
  // private layerState: object | null = null;
  private previewLayerState: object | null = null;
  private updateCallback: AnimationUpdateCallback | null = null;
  private previewing = false;
  public group: AnimationGroup;
  private tweenStates: string[] = [];
  private waitting = false;
  private waittingLayerData: MainLayer | null = null;
  private waittingOptions: LayerAnimation | null = null;
  public available = false;

  constructor(group: AnimationGroup, timeline: gsap.core.Timeline, updateCallback: AnimationUpdateCallback) {
    this.group = group;
    this.timeline = timeline;
    this.updateCallback = updateCallback;
  }

  getTimleine() {
    return this.localTimeline;
  }

  getPreviewTimleine() {
    return this.localPreviewTimeline;
  }
  getGroupPreviewTimeline() {
    return this.group.getGroupPreviewTimeline();
  }

  isBusy() {
    if (this.tweens.length === 0) {
      return false;
    }
    return this.tweenStates.some((state) => {
      return state === 'previewReady' || state === 'previewing';
    });
  }

  update(layerData: MainLayer | null, options: LayerAnimation | null) {
    const equalLayerData = isEqual(layerData, this.layerData);
    const equalOptions = isEqual(options, this.options);
    if (equalLayerData && equalOptions) {
      return false;
    }
    if (this.isBusy()) {
      this.waitting = true;
      this.waittingLayerData = layerData;
      this.waittingOptions = options;
      return false;
    }
    this.clearTween();
    if (this.localTimeline) {
      this.localTimeline.kill();
      this.localTimeline = null;
    }
    if (!equalLayerData) {
      this.layerData = layerData;
    }
    if (!equalOptions) {
      this.schema = null;
      this.options = null;
      const type = options?.ty;
      if (!type) {
        if (this.available !== false) {
          this.available = false;
          return true;
        }
        return false;
      }
      const schema = getAnimationSchema(type);
      if (!schema) {
        if (this.available !== false) {
          this.available = false;
          return true;
        }
        return false;
      }
      this.schema = schema;
      this.options = options;
    }
    this.available = true;
    this.initTween();
    return true;
  }

  private initTween() {
    const { schema, options, layerData } = this;
    if (!schema || !options || !layerData) {
      return;
    }
    this.tweenStates.length = 0;
    this.localTimeline = gsap.timeline({
      duration: (options?.t.duration as number) || 1,
      repeat: options?.t.loop === true ? -1 : 0,
      paused: false,
      immediateRender: false,
    });
    schema.tweens.forEach((setting, idx) => {
      const tween = new AnimationTween(this, idx, setting);
      this.tweens.push(tween);
    });
    this.timeline!.add(this.localTimeline, 0);
  }

  getLayerState() {
    return this.group.getLayerState();
  }

  getLayerData() {
    return this.layerData;
  }

  getOptions() {
    return this.options;
  }

  onTweenStart() {
    this.group.onTweenStart();
  }
  onTweenUpdate() {
    this.group.onTweenUpdate();
  }
  onTweenComplete() {
    this.group.onTweenComplete();
  }

  private clearTween() {
    this.tweens.forEach((tween) => {
      tween.destroy();
    });
    this.tweens.length = 0;
    this.tweenStates.length = 0;
  }
  getGroupPreveiewLayerState() {
    return this.group.getGroupPreveiewLayerState();
  }
  getPreviewLayerState() {
    return this.previewLayerState;
  }

  initPreviewLayerState() {
    this.previewLayerState = {};
  }
  initGroupPreviewItem() {
    this.tweens.forEach((tween) => {
      tween.initGroupPreviewTween();
    });
  }
  startPreview() {
    if (this.previewing) {
      return;
    }
    this.previewing = true;
    this.initPreviewLayerState();
    this.localPreviewTimeline = gsap.timeline({
      duration: (this.options?.t.duration as number) || 1,
      repeat: 0,
      paused: true,
      immediateRender: false,
    });
    this.tweens.forEach((tween, idx) => {
      this.tweenStates[idx] = 'previewReady';
      tween.startPreview();
    });
    this.localPreviewTimeline.play(0, false);
  }

  onTweenPreviewStart(idx: number) {
    this.tweenStates[idx] = 'previewing';
  }
  onTweenPreviewUpdate() {
    if (this.updateCallback) {
      this.updateCallback(this.getPreviewLayerState()!);
    }
  }
  onTweenPreviewComplete(idx: number) {
    this.tweenStates[idx] = 'stopped';
    const isStopped = this.tweenStates.every((i) => i === 'stopped');
    if (!isStopped) {
      return;
    }
    this.clearPreviewAffect();
    this.group.stopPreviewItemBySelf();
    this.previewing = false;
    this.loadNextChange();
  }

  clearPreviewAffect() {
    if (this.localPreviewTimeline) {
      this.localPreviewTimeline.kill();
    }
    if (this.updateCallback) {
      this.updateCallback({});
    }
  }

  stopPreview() {
    if (!this.previewing) {
      return;
    }
    this.tweens.forEach((tween, idx) => {
      tween.stopPreview();
      this.tweenStates[idx] = 'stopped';
    });
    this.clearPreviewAffect();
    this.previewing = false;
    this.loadNextChange();
  }

  loadNextChange() {
    if (this.previewing) {
      return;
    }
    if (this.waitting) {
      this.waitting = false;
      const res = this.update(this.waittingLayerData || this.layerData, this.waittingOptions || this.options);
      if (res) {
        this.group.onTweenChange();
      }
      this.waittingLayerData = null;
      this.waittingOptions = null;
    }
  }

  getTimeInfo() {
    if (!this.available) {
      return null;
    }
    return {
      duration: (this.options?.t.duration as number) || 1,
      delay: (this.options?.t.delay as number) || 0,
    };
  }

  destroy() {
    this.clearTween();
    this.layerData = null;
    this.options = null;
    this.schema = null;
    // 在主线程中, 清空下当前的item, 避免重复等单item设置,影响全局
    this.localTimeline && this.timeline?.remove(this.localTimeline);
    this.timeline = null;
    this.updateCallback = null;
  }
}

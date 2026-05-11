import gsap from 'gsap';
import { AnimationSchemaTween } from '../../interface';
import AnimationItem from './AnimationItem';

export default class AnimationTween {
  private item: AnimationItem;
  private idx: number;
  private setting: AnimationSchemaTween;
  private tween: gsap.core.Tween | null = null;
  private groupPreviewTween: gsap.core.Tween | null = null;
  private previewTween: gsap.core.Tween | null = null;
  // private playing = false;
  // private previewing = false;
  private from: object | null = null;
  private to: object | null = null;
  private svars: { [k: string]: string | number | boolean | undefined } | null = null;
  private position: number = 0;
  private current: object | null = null;

  constructor(item: AnimationItem, idx: number, setting: AnimationSchemaTween) {
    this.item = item;
    this.idx = idx;
    this.setting = setting;

    this.init();
  }

  init() {
    const options = this.item.getOptions()!;
    const keyframes = this.setting.init(this.item.getLayerData(), options);
    if (!keyframes || !keyframes?.from || !keyframes.to) {
      return;
    }
    this.from = keyframes.from;
    this.to = keyframes.to;
    const delay = (options?.t.delay as number) || 0;
    const totalDuration = (options?.t.duration as number) || 1;
    const duration = totalDuration * (this.setting.to - this.setting.from);
    this.position = totalDuration * this.setting.from;

    this.svars = {
      duration,
      delay,
      repeat: this.setting.repeat,
      yoyo: this.setting.yoyo,
      ease: this.setting.ease,
      ...keyframes.setting,
    };

    this.initTween();
  }

  initTween() {
    const timeline = this.item.getTimleine()!;
    this.current = { ...this.from };
    this.tween = gsap.fromTo(this.current, this.current, {
      repeat: 0,
      yoyo: false,
      ease: 'power1.out',
      ...this.to,
      ...this.svars,
      paused: false,
      immediateRender: false,
      onStart: () => {
        this.item.onTweenStart();
      },
      onUpdate: () => {
        if (this.setting.update) {
          this.setting.update(
            this.current!,
            this.item.getLayerState()!,
            this.item.getLayerData(),
            this.item.getOptions()!,
          );
        } else {
          Object.assign(this.item.getLayerState()!, this.current);
        }
        this.item.onTweenUpdate();
      },
      onComplete: () => {
        this.item.onTweenComplete();
      },
    });
    timeline.add(this.tween, this.position);
  }
  initGroupPreviewTween() {
    if (!this.from || !this.to) {
      return;
    }
    const timeline = this.item.getGroupPreviewTimeline();
    if (!timeline) {
      return;
    }
    const from = { ...this.from };
    this.groupPreviewTween = gsap.to(from, {
      repeat: 0,
      yoyo: false,
      ease: 'power1.out',
      ...this.to,
      ...this.svars,
      paused: false,
      immediateRender: false,
      onStart: () => {},
      onUpdate: () => {
        if (this.setting.update) {
          this.setting.update(
            from,
            this.item.getGroupPreveiewLayerState()!,
            this.item.getLayerData(),
            this.item.getOptions()!,
          );
        } else {
          Object.assign(this.item.getGroupPreveiewLayerState()!, from);
        }
      },
      onComplete: () => {},
    });
    timeline.add(this.groupPreviewTween, this.position);
  }
  initPreviewTween() {
    if (!this.from || !this.to) {
      return;
    }
    const timeline = this.item.getPreviewTimleine();
    if (!timeline) {
      return;
    }
    const from = { ...this.from };
    this.previewTween = gsap.to(from, {
      repeat: 0,
      yoyo: false,
      ease: 'power1.out',
      ...this.to,
      ...this.svars,
      paused: false,
      immediateRender: false,
      onStart: () => {
        this.item.onTweenPreviewStart(this.idx);
      },
      onUpdate: () => {
        if (this.setting.update) {
          this.setting.update(
            from,
            this.item.getPreviewLayerState()!,
            this.item.getLayerData(),
            this.item.getOptions()!,
          );
        } else {
          Object.assign(this.item.getPreviewLayerState()!, from);
        }
        this.item.onTweenPreviewUpdate();
      },
      onComplete: () => {
        this.item.onTweenPreviewComplete(this.idx);
      },
    });
    timeline.add(this.previewTween, this.position);
  }

  startPreview() {
    // this.previewing = true;
    this.initPreviewTween();
  }

  stopPreview() {
    if (this.previewTween) {
      this.previewTween.kill();
      this.previewTween = null;
    }
    // this.previewing = false;
  }

  destroy() {
    this.stopPreview();
    if (this.tween) {
      this.tween.kill();
      this.tween = null;
    }
  }
}

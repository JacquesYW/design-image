import gsap from 'gsap';
import { AnimationUpdateCallback } from '../../interface';
import AnimationGroup from './AnimationGroup';

export default class AnimationManager {
  private timeline?: gsap.core.Timeline;
  private groups: Map<string, AnimationGroup> = new Map();
  private previewingGroup: AnimationGroup | null = null;
  private previewType: 'timeline' | 'item' | 'group' | null = null;
  private state: {
    playing: boolean;
    previewingItem: boolean;
    previewingGroup: boolean;
    previewingTimeline: boolean;
    duration: number;
    progress: number | string;
    count: number;
  } = {
    playing: false,
    previewingItem: false,
    previewingGroup: false,
    previewingTimeline: false,
    duration: 0,
    progress: 0,
    count: 0,
  };
  private callback: (state: AnimationManager['state']) => void;

  constructor(callback: (state: AnimationManager['state']) => void) {
    this.callback = callback;
  }

  ensureTimeline() {
    if (!this.timeline) {
      this.timeline = gsap.timeline({
        paused: true,
        immediateRender: false,
        onStart: () => {
          this.onTimelineStart();
        },
        onUpdate: () => {
          this.onTimelineUpdate();
        },
        onComplete: () => {
          this.onTimelineComplete();
        },
      });
    }
    return this.timeline;
  }

  ensure(id: string, updateCallback: AnimationUpdateCallback) {
    let group = this.groups.get(id);
    if (!group) {
      group = new AnimationGroup(this, id, this.ensureTimeline(), updateCallback);
      this.groups.set(id, group);
    }
    return group;
  }

  remove(group: AnimationGroup) {
    if (!group) {
      return;
    }
    this.groups.delete(group.id);
    group.destroy();
    this.onTweenChange();
  }

  onTimelineStart() {}

  onTimelineUpdate() {
    if (!this.timeline) {
      return;
    }
    const { duration } = this.state;
    let progress: string;
    if (!duration) {
      progress = '0';
    } else {
      /* 暂时不清楚为什么需要 toFixed(1), 与seek功能冲突, 先注释 */
      // progress = ((this.timeline!.progress() * this.timeline!.duration()) % duration).toFixed(1);
      progress = ((this.timeline!.progress() * this.timeline!.duration()) % duration) + '';
    }

    this.setState({ progress });
  }

  onTimelineComplete() {
    if (this.previewType === 'timeline') {
      if (this.timeline) {
        this.timeline.pause(0);
      }
      this.stopPreviewTimelineBySelf();
    }
  }

  togglePreviewTimeline() {
    if (this.previewType !== 'timeline') {
      this.startPreviewTimeline();
    } else {
      this.stopPreview();
    }
  }

  startPreviewTimeline() {
    if (this.previewType === 'timeline' || !this.timeline) {
      return;
    }
    this._stopPreview();
    this.previewType = 'timeline';
    this.timeline.play(0, true);
    this.setState({
      previewingTimeline: true,
      progress: 0,
    });
  }
  startPreviewGroup(id: string) {
    const group = this.groups.get(id);
    if (!group) {
      return;
    }
    if (this.previewType === 'group' && group === this.previewingGroup) {
      this._stopPreview();
      return;
    }
    this.previewType = 'group';
    this.previewingGroup = group;
    group.startPreviewGroup();
    this.setState({
      previewingGroup: true,
    });
  }
  startPreviewItem(id: string, idx: number) {
    const group = this.groups.get(id);
    if (!group) {
      return;
    }
    if (this.previewType === 'item' && group === this.previewingGroup) {
      this._stopPreview();
      return;
    }
    this.previewType = 'item';
    this.previewingGroup = group;
    group.startPreviewItem(idx);
    this.setState({
      previewingItem: true,
    });
  }

  stopPreview() {
    this._stopPreview();
    this.setState({
      previewingItem: false,
      previewingTimeline: false,
      progress: 0,
    });
  }

  _stopPreview() {
    if (this.previewType === 'timeline') {
      this._stopPreviewTimeline();
    } else if (this.previewType === 'item') {
      this._stopPreviewItem();
    } else if (this.previewType === 'group') {
      this._stopPreviewGroup();
    }
    this.previewType = null;
  }

  _stopPreviewTimeline() {
    if (this.previewType !== 'timeline') {
      return;
    }
    if (this.timeline) {
      this.timeline.pause(0, false);
    }
    this.clearPreviewAffect();
  }
  _stopPreviewGroup() {
    if (this.previewType !== 'group') {
      return;
    }
    if (this.previewingGroup) {
      this.previewingGroup.stopPreviewGroup();
    }
    this.previewingGroup = null;
  }
  _stopPreviewItem() {
    if (this.previewType !== 'item') {
      return;
    }
    if (this.previewingGroup) {
      this.previewingGroup.stopPreviewItem();
    }
    this.previewingGroup = null;
  }

  stopPreviewTimelineBySelf() {
    this.previewType = null;
    this.clearPreviewAffect();
    this.setState({
      previewingTimeline: false,
      progress: 0,
    });
  }

  stopPreviewGroupBySelf() {
    this.previewType = null;
    this.previewingGroup = null;
    this.setState({
      previewingGroup: false,
    });
  }

  stopPreviewItemBySelf() {
    this.previewType = null;
    this.previewingGroup = null;
    this.setState({
      previewingItem: false,
    });
  }

  clearPreviewAffect() {
    this.groups.forEach((group) => {
      group.clearPreviewAffect();
    });
  }

  count() {
    let sum = 0;
    this.groups.forEach((group) => {
      sum += group.count();
    }, 0);
    return sum;
  }

  getTimeInfo() {
    let maxDuration = 0;
    this.groups.forEach((group) => {
      const groupTimeInfo = group.getTimeInfo();
      if (groupTimeInfo.duration > maxDuration) {
        maxDuration = groupTimeInfo.duration;
      }
    });
    return {
      duration: maxDuration,
    };
  }

  onTweenChange() {
    const timeInfo = this.getTimeInfo();
    this.setState({
      count: this.count(),
      duration: timeInfo.duration,
    });
  }

  private setState(partState: Partial<AnimationManager['state']>) {
    if (!partState) {
      return;
    }
    const changed = Object.keys(partState).some((k) => {
      return partState[k as keyof AnimationManager['state']] !== this.state[k as keyof AnimationManager['state']];
    });
    if (!changed) {
      return;
    }
    Object.assign(this.state, partState);
    if (this.callback) {
      this.callback(this.getState());
    }
  }

  getState() {
    return {
      ...this.state,
    };
  }
  getTimeline() {
    return this.timeline;
  }
  seek(time: number) {
    if (this.timeline) {
      this.timeline.seek(time, false);
    }
  }

  reset() {
    if (this.timeline) {
      this.timeline.pause(0, true);
    }
    this.clearPreviewAffect();
  }
}

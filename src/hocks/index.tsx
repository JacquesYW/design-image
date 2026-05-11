import { useReducer } from 'react';
import _ from 'lodash';

/*
  自定义useReducer函数
  extraFn - dispatch触发时同步触发的函数
  unActionExtra: 开关extraFn函数的触发
*/
type NewSetType<T> = (action: Partial<T>, unActionExtra?: boolean) => void;
export const useReducerFun = <T,>(
  initState: T,
  extraFn?: (arg: Partial<T>) => void,
): [T & Partial<T>, NewSetType<T>] => {
  const [data, setFunc] = useReducer((state: T, action: Partial<T>) => {
    return {
      ...state,
      ...action,
    };
  }, initState);
  const newSet: NewSetType<T> = useCallback(
    (action, unActionExtra) => {
      if (!unActionExtra && extraFn && typeof extraFn == 'function') {
        extraFn(action);
      }
      setFunc(action);
    },
    [setFunc, extraFn],
  );
  return [data, newSet];
};

import { produce, applyPatches, Patch, enablePatches, Objectish } from 'immer';

enablePatches();

export const mergeFn = (objValue: unknown, srcValue: unknown) => {
  /* 数组类型需要直接赋值,避免删除功能出现问题 */
  if (_.isArray(objValue) && _.isArray(srcValue) && objValue.length > srcValue.length) {
    return srcValue;
  }
  /* 避免某些值删除了, 还是被合并 */
  if (_.isEmpty(srcValue)) {
    return srcValue;
  }
};
export const merge = <P, N>(preData: P, newData: N) => {
  return produce(preData, (draft) => _.mergeWith(draft, newData, mergeFn));
};
/* 撤销/重做数据控制 */
export const useUndo = <T extends Objectish>(initState: T) => {
  const ref = useRef({
    paths: [] as Array<{
      patches: Patch[];
      inversePatches: Patch[];
    }>,
    index: 0,
    delayState: {
      patch: [] as unknown[],
      unPatch: [] as unknown[],
    },
    delayFn: {
      patch: [] as ((draft: T) => T)[],
      unPatch: [] as ((draft: T) => T)[],
    },
    resolves: [] as Array<(state: T) => void>,
    timer: null as NodeJS.Timeout | null,
    timer1: null as NodeJS.Timeout | null,
    thenFns: [] as Array<(state: T) => void>,
  });
  const [state, setState] = useState(initState);
  useEffect(() => {
    return () => {
      if (ref.current.timer) {
        clearTimeout(ref.current.timer);
      }
      if (ref.current.timer1) {
        clearTimeout(ref.current.timer1);
      }
    };
  }, []);
  /* 
    patches: 正修改的数据
    inversePatches: 逆修改的数据
  */
  const patchManage = useCallback((patches: Patch[], inversePatches: Patch[], isPoint: boolean) => {
    if (isPoint && patches.length > 0 && inversePatches.length > 0) {
      if (ref.current.index < ref.current.paths.length) {
        ref.current.paths = ref.current.paths.slice(0, ref.current.index);
      }
      // 每次修改数据, 重置掉重做的数据
      ref.current.paths.push({
        patches,
        inversePatches,
      });
      ref.current.index = ref.current.paths.length;
    }
  }, []);
  useEffect(() => {
    const fns = [...ref.current.thenFns];
    ref.current.thenFns = [];
    fns.forEach((fn) => {
      fn(state);
    });
  }, [state]);
  const action = {
    // 撤销
    undo: () => {
      ref.current.index -= 1;
      const { inversePatches } = ref.current.paths[ref.current.index];
      setState(applyPatches(state, inversePatches));
    },
    // 重做
    redo: () => {
      const { patches } = ref.current.paths[ref.current.index];
      ref.current.index += 1;
      setState(applyPatches(state, patches));
    },
    // 更新数据 - 做删除等操作
    updateState: (fn: (draft: T) => T, isPoint = true) => {
      return new Promise((resolve) => {
        /* 
          延迟触发更新 
          区别是否需要记录操作的数据更新
          先合并不需要触发记录的数据合并,
          在和需要触发记录的数据合并更新
        */
        if (isPoint) {
          ref.current.delayFn.patch.push(fn);
        } else {
          ref.current.delayFn.unPatch.push(fn);
        }
        ref.current.resolves.push(resolve);
        if (ref.current.timer1) {
          clearTimeout(ref.current.timer1);
        }
        ref.current.timer1 = setTimeout(() => {
          const unPatchFn = _.flow(ref.current.delayFn.unPatch);
          const patchFn = _.flow(ref.current.delayFn.patch);
          ref.current.delayFn = {
            patch: [],
            unPatch: [],
          };
          /* 
            先合并需要记录操作的数据, 再合并不需要记录操作的数据
            避免拖拽等操作,造成的前后数据一致,影响了数据记录
          */
          const pState = produce(state, patchFn, (patches, inversePatches) => {
            patchManage(patches, inversePatches, true);
          });
          setState(
            produce(pState, unPatchFn, (patches, inversePatches) => {
              patchManage(patches, inversePatches, false);
              ref.current.thenFns.push((nextState) => {
                ref.current.resolves.forEach((fn) => {
                  fn(nextState);
                });
                ref.current.resolves = [];
              });
            }),
          );
        }, 20);
      });
    },
    setState: (data: DeepPartial<T>, isPoint = true) => {
      return action.updateState((draft) => {
        return _.mergeWith(draft, data, mergeFn);
      }, isPoint);
    },

    // 类似初始化数据
    initState: (data: DeepPartial<T>) => {
      ref.current.index = 0;
      ref.current.paths = [];
      setState(data as T);
    },
    resetState: (data: T, isPont = true) => {
      setState(
        produce(
          state,
          () => {
            return data;
          },
          (patches, inversePatches) => {
            patchManage(patches, inversePatches, isPont);
          },
        ),
      );
    },
  };
  return {
    state: state,
    canRedo: ref.current.paths.length > 0 && ref.current.index < ref.current.paths.length,
    canUndo: ref.current.paths.length > 0 && ref.current.index > 0,
    past: ref.current.paths,
    ...action,
  };
};

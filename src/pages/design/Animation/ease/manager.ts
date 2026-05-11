interface EaseSetting {
  icon: string;
  name: string;
  title: string;
  ease: string | (() => gsap.EaseFunction);
}
const eases: {
  [k: string]: EaseSetting;
} = {};

export const addEase = (easeSetting: EaseSetting) => {
  eases[easeSetting.name] = easeSetting;
};

export const getEaseFunction = (easeName: string) => {
  const ease = eases[easeName];
  if (ease) {
    if (typeof ease.ease === 'string') {
      return ease.ease;
    }
    return ease.ease();
  }
  return null;
};

export const getEaseList = () => {
  return Object.values(eases);
};

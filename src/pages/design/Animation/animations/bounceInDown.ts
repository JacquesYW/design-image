import { AnimationSchema } from '../../interface';
import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';
import { commonDefaults, commonSettings } from './common';

gsap.registerPlugin(CustomEase);
const ease = CustomEase.create('bounceInDown', '0.215, 0.61, 0.355, 1');

const schema: AnimationSchema = {
  type: 'bounce-in-down',
  name: '掉落',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/bounce-in-down.gif',
  defaults: {
    ...commonDefaults,
  },
  settings: [...commonSettings],
  tweens: [
    {
      ease,
      from: 0,
      to: 0.6,
      repeat: 0,
      yoyo: false,
      init: (layerData) => {
        const y = layerData?.tr.y || 0;
        return {
          from: { o: 0, y: y - 3000 },
          to: { o: 1, y: y + 25 },
        };
      },
    },
    {
      ease,
      from: 0.6,
      to: 0.75,
      repeat: 0,
      yoyo: false,
      init: (layerData) => {
        const y = layerData?.tr.y || 0;
        return {
          from: { o: 1, y: y + 25 },
          to: { o: 1, y: y - 10 },
        };
      },
    },
    {
      ease,
      from: 0.75,
      to: 0.9,
      repeat: 0,
      yoyo: false,
      init: (layerData) => {
        const y = layerData?.tr.y || 0;
        return {
          from: { o: 1, y: y - 10 },
          to: { o: 1, y: y + 5 },
        };
      },
    },
    {
      ease,
      from: 0.9,
      to: 1,
      repeat: 0,
      yoyo: false,
      init: (layerData) => {
        const y = layerData?.tr.y || 0;
        return {
          from: { o: 1, y: y + 5 },
          to: { o: 1, y },
        };
      },
    },
  ],
};

export default schema;

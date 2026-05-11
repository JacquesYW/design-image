import { Layer } from '../../interface';

export type SinglePanel<L = Layer> = {
  id: string;
  layer: L;
};

export type MorePanel<L = Layer> = {
  ids: string[];
  layers: L[];
};

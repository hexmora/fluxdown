import { EFFECT_SAMPLES } from '../../samples';

export const TIMING = {
  chunks: [42, 58, 47, 64, 39, 53],
  delays: [110, 96, 124, 92, 115, 105],
};

export const COPY = {
  zh: {
    label: '分块淡入效果',
    caption: '每次到达的文字，一起淡入',
    source: EFFECT_SAMPLES.zh,
  },
  en: {
    label: 'Chunk entrance effect',
    caption: 'Each arriving group fades in together',
    source: EFFECT_SAMPLES.en,
  },
};

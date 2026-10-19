import { SUFFIX_SAMPLES } from './samples';

export const COPY = {
  zh: {
    label: '流式末尾标记',
    caption: '跟随当前内容的末尾',
    type: '标记样式',
    sample: '内容类型',
    cursor: '方块',
    dot: '圆点',
    custom: '自定义',
    customRenderer: '启用自定义 renderer',
    inspect: '播放完成后保留标记，便于查看位置。实际应用中，将 streaming 设为 false 即可移除。',
    samples: SUFFIX_SAMPLES.zh,
  },
  en: {
    label: 'Streaming suffix',
    caption: 'Follow the end of the content',
    type: 'Marker style',
    sample: 'Content type',
    cursor: 'Cursor',
    dot: 'Dot',
    custom: 'Custom',
    customRenderer: 'Enable the custom renderer',
    inspect:
      'The marker stays visible after playback so you can inspect its position. In your app, set streaming to false to remove it.',
    samples: SUFFIX_SAMPLES.en,
  },
};

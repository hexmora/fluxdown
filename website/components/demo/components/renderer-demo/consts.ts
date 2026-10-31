export const COPY = {
  zh: {
    label: '渲染库对比',
    renderers: '选择渲染库（至少选择一个，可多选）',
    static: '静态',
    streaming: '流式',
    effect: '动画效果',
    hint: '同步播放 · 向上滚动可暂停跟随，回到底部继续',
    scroll: '横向滚动查看所有渲染库',
  },
  en: {
    label: 'Renderer comparison',
    renderers: 'Choose renderers (select at least one)',
    static: 'Static',
    streaming: 'Streaming',
    effect: 'Effect',
    hint: 'Play together · Scroll up to read, return to the bottom to follow',
    scroll: 'Scroll horizontally to see every renderer',
  },
};

export const EFFECTS = ['scale', 'shad', 'chunk', 'suffix'] as const;

export const MODES = ['static', 'streaming'] as const;

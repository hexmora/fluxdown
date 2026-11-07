export const COPY = {
  zh: {
    repair: '语法还没写完',
    progress: '拖动，停在任意位置',
    source: '已收到的 Markdown',
    plain: '关闭修复',
    repaired: '开启修复',
    samples: [
      { label: '加粗', text: '先看 **今天的重点**，再继续。' },
      { label: '行内代码', text: '试试 `streaming` 这个选项。' },
      {
        label: '链接',
        text: '阅读 [快速开始](/zh/guide/react/quick-start.html)。',
      },
    ],
    smooth: '同一份文本，两种显示节奏',
    incoming: '收到即显示',
    smoothed: '平滑显示',
    effect: '入场效果',
    none: '无动画',
    shad: '末尾渐变',
    scale: '逐字缩放',
    suffix: '末尾标记',
    stream:
      '周末想去海边，先看看天气，再挑一班不用早起的列车。车窗外的楼房渐渐变少，远处开始有了山的轮廓。\n\n行李可以少一点：一本书、一副耳机，还有留给沿途风景的时间。到了以后，沿着岸边慢慢走，找一家能坐下来吹风的小店。\n\n不必把每个小时都排满。等太阳落下，再决定晚饭吃什么。回程前买一张明信片，把今天最喜欢的一刻写下来。往后翻到它时，也许又会想去海边。',
    slots: '同一段引用，换一种呈现',
    default: '默认引用',
    custom: '提示卡片',
    note: '出发前',
    quote: '> 带上耳机，下载好离线地图。\n> **不赶时间**，也是旅行的一部分。',
  },
  en: {
    repair: 'Before the syntax is complete',
    progress: 'Drag to pause at any point',
    source: 'Markdown received so far',
    plain: 'Repair off',
    repaired: 'Repair on',
    samples: [
      { label: 'Bold', text: 'Start with **the highlights**, then keep going.' },
      { label: 'Inline code', text: 'Try the `streaming` option.' },
      {
        label: 'Link',
        text: 'Read the [quick start](/guide/react/quick-start.html).',
      },
    ],
    smooth: 'One stream, two reading paces',
    incoming: 'As received',
    smoothed: 'Smoothed',
    effect: 'Entrance effect',
    none: 'No animation',
    shad: 'Trailing fade',
    scale: 'Character scale',
    suffix: 'Trailing marker',
    stream:
      'A weekend by the sea starts with a weather check and a train that leaves after breakfast. Watch the city give way to hills outside the window.\n\nPack a book and headphones. At the coast, take a slow walk along the shore and find a café with a view.\n\nLeave a little space in the plan. There is time to watch the sunset before deciding where to have dinner.',
    slots: 'The same quote, a different presentation',
    default: 'Default quote',
    custom: 'Note card',
    note: 'Before you go',
    quote:
      '> Bring headphones and download an offline map.\n> **Taking your time** is part of the trip.',
  },
};

export const TIMING = { steps: 8, chunks: [12, 28, 8, 22], delays: [380, 900, 500, 1100] };

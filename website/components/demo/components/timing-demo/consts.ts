export const TIMING = {
  chunks: [1],
  delays: [1, 3, 4, 4],
};

export const COPY = {
  zh: {
    chunks: [
      '一段话正在展开。开头只有几个字，接着，一整句话忽然到了，显示进度也开始追赶。',
      '文字已经收到，可以保持稳定的阅读速度，也可以随等待显示的内容加快一点。',
      '灰色进度是已收到的内容，绿色进度是已显示的内容；两者之间，还留着一点缓冲。',
      '最后一段也到了。网络停下来，已经收到的文字仍会继续显示，直到两边都读完。',
    ],
    tickerTitle: '同一速度，不同更新间隔',
    schedulerTitle: '同样的来稿，两种阅读节奏',
    received: '已收到',
    visible: '已显示',
    raf: '跟随屏幕刷新',
    interval: '每 240 ms 更新',
    spring: '弹簧 · 随积压调整',
    steady: '匀速 · 保持阅读速度',
  },
  en: {
    chunks: [
      'A paragraph arrives at once. Both sides receive it together, then begin to reveal it. ',
      'More words are here. Keep a steady reading pace, or adjust it as the buffer grows. ',
      'The gray bar marks received text. The green bar follows the words already on screen. ',
      'One last paragraph. The same message, with two different ways to catch up. Replay to compare.',
    ],
    tickerTitle: 'One speed, different update intervals',
    schedulerTitle: 'One stream, two reading rhythms',
    received: 'Received',
    visible: 'Visible',
    raf: 'Every animation frame',
    interval: 'Every 240 ms',
    spring: 'Spring · adapts to the buffer',
    steady: 'Steady · fixed reading pace',
  },
};

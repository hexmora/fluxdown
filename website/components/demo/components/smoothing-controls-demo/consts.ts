import {
  CoarseTicker,
  FastTicker,
  LargeStepScheduler,
  SlowTicker,
  SmallStepScheduler,
  StepScheduler,
} from './strategies';

export const TICKERS = [FastTicker, SlowTicker, CoarseTicker];

export const SCHEDULERS = [SmallStepScheduler, StepScheduler, LargeStepScheduler];

export const TIMING = { steps: 8, chunks: [26, 42, 18, 36], delays: [400, 900, 700, 1100] };

export const COPY = {
  zh: {
    tickerLabel: '节奏器对照演示',
    schedulerLabel: '追踪器对照演示',
    ticker: '更新间隔',
    scheduler: '每拍步长',
    units: '单位',
    replay: '重新播放',
    received: '已收到',
    raf: '跟随动画帧',
    spring: '弹簧追踪',
    tickerNote: '同样的内容，同一个弹簧追踪器。',
    schedulerNote: '同样的内容，每 80 毫秒一拍。',
    source:
      '雨停了，窗外的树叶还在滴水。我把今天的笔记翻到最后一页，补上刚才没来得及写完的那句话。\n\n有些片段只有几个字，有些一下就来了一整句。文字先进入缓冲区，再按照各自的节奏出现在页面上。收到内容暂时停下来时，已经排队的文字还可以继续显示。\n\n点一下这片文字，让下一批内容提前到达，再看看两边怎样追上。也可以换个参数，从头比较一遍。\n\n**读到这里，刚好写完。**',
  },
  en: {
    tickerLabel: 'Ticker comparison',
    schedulerLabel: 'Scheduler comparison',
    ticker: 'Tick interval',
    scheduler: 'Advance per tick',
    units: 'units',
    replay: 'Replay',
    received: 'Received',
    raf: 'Animation frames',
    spring: 'Spring tracking',
    tickerNote: 'The same text and spring scheduler on both sides.',
    schedulerNote: 'The same text, with one tick every 80 milliseconds.',
    source:
      'The rain has stopped. Water still falls from the leaves. I open my notebook and finish the thought I left on the last page.\n\nA few words arrive, then a whole sentence. They wait in the buffer before appearing at their own pace. Even when the input pauses, the waiting text can keep moving.\n\nClick this text to bring the next batch forward. Watch both sides catch up, or choose another setting and compare again.\n\n**One last sentence, then done.**',
  },
};

import type { RepairSample } from './type';

export const SAMPLES: RepairSample[] = [
  {
    id: 'strong',
    label: { zh: '加粗与链接', en: 'Strong & links' },
    source: '**Streaming text** and [a guide](https://example.com).',
  },
  {
    id: 'list',
    label: { zh: '列表与任务', en: 'Lists & tasks' },
    source: '9. First item\n10. Next item\n\n- [x] Checked\n- [ ] Pending',
  },
  {
    id: 'table',
    label: { zh: '表格与行内代码', en: 'Table & inline code' },
    source: '| Name | Value |\n| --- | --- |\n| **Code** | `a * b` |',
  },
  {
    id: 'html',
    label: { zh: 'HTML 与实体', en: 'HTML & entities' },
    source: 'Read <a href="https://example.com">the guide</a> &amp; more.',
  },
  {
    id: 'math',
    label: { zh: '公式与分式', en: 'Math & fractions' },
    source: 'The result: $x+\\frac{a}{b}+\\sqrt{c}$, then continue.',
  },
  {
    id: 'reference',
    label: { zh: '后置引用', en: 'Late references' },
    source: 'Read [the guide][manual].\n\n[manual]: https://example.com "Guide"',
  },
];

export const COPY = {
  zh: {
    title: '同一份逐字输入，比较修复前后',
    play: '播放',
    pause: '暂停',
    replay: '重播',
    step: '下一字',
    finish: '结束输入',
    speed: '字/秒',
    position: '输入进度',
    raw: '收到的 Markdown',
    off: '关闭语法修复',
    on: '开启语法修复',
    pending: '流式中 · 暂停不等于结束',
    done: '输入已结束 · 恢复完整文本语义',
    hint: '两边使用相同输入；关闭平滑与动画，只比较语法修复。',
  },
  en: {
    title: 'The same character stream, with and without repair',
    play: 'Play',
    pause: 'Pause',
    replay: 'Replay',
    step: 'Next character',
    finish: 'End input',
    speed: 'chars/s',
    position: 'Input progress',
    raw: 'Received Markdown',
    off: 'Repair off',
    on: 'Repair on',
    pending: 'Streaming · pausing does not end the input',
    done: 'Input ended · full source semantics restored',
    hint: 'Both panes receive the same text. Smoothing and effects are disabled.',
  },
};

import type { EditorTuning } from './type';

export const COPY = {
  en: {
    title: 'Try your own Markdown.',
    description: 'Edit on the left. See Fluxdown respond on the right.',
    source: 'Markdown',
    preview: 'Preview',
    reset: 'Reset content',
    play: 'Play',
    pause: 'Pause',
    replay: 'Replay',
    smooth: 'Smooth text',
    repair: 'Complete unfinished syntax',
    effect: 'Effect',
    noEffect: 'None',
    shadEffect: 'Trailing fade',
    scaleEffect: 'Scale',
    speed: 'Speed',
    tune: 'Tune',
    frequency: 'Spring frequency',
    damping: 'Damping ratio',
    underdamped: 'Underdamped',
    critical: 'Critically damped',
    overdamped: 'Overdamped',
    pace: 'Chunk pace',
    paceFast: 'Fast',
    paceSteady: 'Steady',
    paceSlow: 'Slow',
    fadeLength: 'Fade length',
    entranceDuration: 'Entrance duration',
    resetTuning: 'Restore defaults',
    placeholder: 'Write some Markdown…',
    empty: 'Your preview starts here.',
    characters: 'characters',
    note: 'Your changes stay in this browser tab.',
  },
  zh: {
    title: '试试你自己的 Markdown。',
    description: '在左侧编辑，在右侧即刻看到结果。',
    source: 'Markdown',
    preview: '实时预览',
    reset: '重置内容',
    play: '播放',
    pause: '暂停',
    replay: '重新播放',
    smooth: '平滑输出',
    repair: '补全未完成的语法',
    effect: '特效',
    noEffect: '关闭',
    shadEffect: '末尾渐变',
    scaleEffect: '逐字缩放',
    speed: '速度',
    tune: '调参',
    frequency: '弹簧频率',
    damping: '阻尼比',
    underdamped: '欠阻尼',
    critical: '临界阻尼',
    overdamped: '过阻尼',
    pace: '分块节奏',
    paceFast: '快',
    paceSteady: '适中',
    paceSlow: '慢',
    fadeLength: '渐变长度',
    entranceDuration: '入场时长',
    resetTuning: '恢复默认',
    placeholder: '写点 Markdown…',
    empty: '你的预览，从这里开始。',
    characters: '个字符',
    note: '修改仅保留在当前浏览器标签页。',
  },
};

/**
 * Playback rates offered for slowing every animation down.
 */
export const ANIMATION_SPEEDS = [0.1, 0.25, 0.5, 1] as const;

/**
 * Default trailing-fade hide delay and scale duration, in milliseconds at 1×.
 */
export const EFFECT_DURATION = 200;

/**
 * Delay multipliers for simulated chunk arrivals.
 */
export const CHUNK_PACES = { fast: 0.25, steady: 1, slow: 2.5 } as const;

export const DEFAULT_TUNING: EditorTuning = {
  frequency: 5,
  dampingRatio: 1,
  pace: 'steady',
  fadeLength: 10,
  entranceDuration: EFFECT_DURATION,
};

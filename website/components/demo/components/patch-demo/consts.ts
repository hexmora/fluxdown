import type { Locale } from '../../../type';

export const COPY = {
  zh: {
    staticLabel: '在文字里插入城市标签和来源',
    staticCaption: '同一段文字，多一点信息',
    original: '原文',
    patched: '插入后',
    source: '周末去杭州，沿着西湖走一走。',
    city: '杭州',
    cityTitle: '杭州 · 散步计划',
    cityDetail: '城市标签可以打开地点详情，也可以连接到你自己的页面。',
    citationTitle: '来源 1 · 我的旅行笔记',
    citationDetail: '这是演示用的来源。正文保持原样，来源信息由应用单独提供。',
    hint: '点击城市标签或来源编号，看看它们带来的信息。',
    originalHint: '这就是传给 Fluxdown 的原始字符串。',
    sourceLabel: '查看来源',
    streamLabel: '流式文字中的来源插入',
    streamCaption: '文字继续，来源留在对应的句子旁',
    streamSource:
      '周末去杭州，沿着西湖走一走。找家小店坐下来，翻几页书，再继续散步。傍晚回到湖边，看天色一点点暗下来。',
    firstSentence: '周末去杭州，沿着西湖走一走。',
    secondSentence: '找家小店坐下来，翻几页书，再继续散步。',
    streamHint: '来源编号出现后可以点击；后面的文字仍会继续。',
    streamSources: [
      { title: '来源 1 · 路线笔记', detail: '湖边步行路线，保存在这句话旁边。' },
      { title: '来源 2 · 途中停留', detail: '小店与阅读时间，是这段行程的另一条补充。' },
    ],
  },
  en: {
    staticLabel: 'Insert a place label and a source into text',
    staticCaption: 'The same sentence, with a little more context',
    original: 'Original',
    patched: 'With patches',
    source: 'Spend the weekend in Hangzhou and take a walk by West Lake.',
    city: 'Hangzhou',
    cityTitle: 'Hangzhou · Walking plan',
    cityDetail: 'A place label can open a detail panel or link to a page in your app.',
    citationTitle: 'Source 1 · My travel notes',
    citationDetail:
      'This is a sample source. The app supplies it separately, keeping the original text intact.',
    hint: 'Click the place label or source number to see the extra context.',
    originalHint: 'This is the original string passed to Fluxdown.',
    sourceLabel: 'View source',
    streamLabel: 'Source references in streaming text',
    streamCaption: 'The text continues. Each source stays with its sentence.',
    streamSource:
      'Spend the weekend in Hangzhou and take a walk by West Lake. Stop at a small café, read a few pages, then carry on walking. Return to the lake at dusk and watch the light slowly fade.',
    firstSentence: 'Spend the weekend in Hangzhou and take a walk by West Lake.',
    secondSentence: ' Stop at a small café, read a few pages, then carry on walking.',
    streamHint: 'Click a source number when it appears. The text can keep arriving.',
    streamSources: [
      { title: 'Source 1 · Route notes', detail: 'The lakeside route, attached to its sentence.' },
      { title: 'Source 2 · A place to pause', detail: 'A short reading stop along the way.' },
    ],
  },
} satisfies Record<Locale, object>;

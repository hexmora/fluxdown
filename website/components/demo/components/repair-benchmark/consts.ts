export const COPY = {
  zh: {
    title: '跳变帧率（%）· 越低越稳定 · 高亮为每行最低值（含并列）',
    category: '语法类别',
    all: '整体',
    cases: '样例数',
  },
  en: {
    title: 'Jump-frame rate (%) · lower is more stable · row minima highlighted, including ties',
    category: 'Syntax category',
    all: 'Overall',
    cases: 'Cases',
  },
};

export const CATEGORIES: Record<'zh' | 'en', Record<string, string>> = {
  zh: {
    普通文本与歧义: '字面量对照',
    歧义与普通文本: '普通文本回归',
  },
  en: {
    强调与删除线: 'Emphasis & deletion',
    行内代码: 'Inline code',
    嵌套行内: 'Nested inline syntax',
    列表与任务: 'Lists & tasks',
    标题与引用: 'Headings & quotes',
    围栏代码: 'Fenced code',
    链接与图片: 'Links & images',
    自动链接: 'Autolinks',
    表格: 'Tables',
    普通文本与歧义: 'Literal controls',
    转义与实体: 'Escapes & entities',
    混合文档: 'Mixed documents',
    歧义与普通文本: 'Prose regression',
  },
};

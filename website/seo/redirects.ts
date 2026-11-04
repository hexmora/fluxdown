// Keep the published Lynx URLs when splitting React Lynx and Vue Lynx guides.
const lynxPages = [
  'configuration',
  'customization',
  'migration/lynx-markdown',
  'plugins',
  'plugins/aggregate',
  'plugins/matrix',
  'plugins/render',
  'plugins/slot',
  'quick-start',
  'streaming',
];

export const redirects = new Map<string, string>(
  ['', 'zh/'].flatMap((locale) =>
    lynxPages.map(
      (page) =>
        [`${locale}guide/lynx/${page}.html`, `${locale}guide/react-lynx/${page}.html`] as const,
    ),
  ),
);

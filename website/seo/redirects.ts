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

// Keep the smoothing guide URLs after renaming ticker and scheduler to driver and interpolation.
const smoothingPages = [
  ['ticker', 'driver'],
  ['scheduler', 'interpolation'],
] as const;

const smoothing = 'guide/common/streaming-effects/smoothing';

export const redirects = new Map<string, string>(
  ['', 'zh/'].flatMap((locale) => [
    ...lynxPages.map(
      (page) =>
        [`${locale}guide/lynx/${page}.html`, `${locale}guide/react-lynx/${page}.html`] as const,
    ),
    ...smoothingPages.map(
      ([from, to]) =>
        [`${locale}${smoothing}/${from}.html`, `${locale}${smoothing}/${to}.html`] as const,
    ),
  ]),
);

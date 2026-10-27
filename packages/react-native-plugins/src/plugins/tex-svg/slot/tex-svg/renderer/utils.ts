import { once } from 'lodash-es';

export const loadSvgRenderer = /*#__PURE__*/ once(async () => {
  const navigator = typeof window === 'undefined' ? undefined : window.navigator;

  if (!navigator) {
    return import('./components/svg');
  }

  const fields = (['appVersion', 'userAgent'] as const).filter(
    (field) => typeof navigator[field] !== 'string',
  );

  const descriptors = fields.map((field) => Object.getOwnPropertyDescriptor(navigator, field));

  try {
    // MathJax checks browser metadata before selecting its headless adaptor.
    for (const field of fields) {
      Object.defineProperty(navigator, field, { configurable: true, value: '' });
    }

    return await import('./components/svg');
  } finally {
    fields.forEach((field, index) => {
      const descriptor = descriptors[index];

      if (descriptor) {
        Object.defineProperty(navigator, field, descriptor);
      } else {
        Reflect.deleteProperty(navigator, field);
      }
    });
  }
});

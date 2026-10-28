import type { Element } from 'hast';

import { fireEvent, render } from '@testing-library/react';

import { ImageRenderer } from '../renderer';

const current: Element = {
  type: 'element',
  tagName: 'img',
  properties: {},
  children: [],
};

test('uses intrinsic image width while preserving explicit styles', () => {
  const props = {
    Raw: null,
    current,
    parents: [],
    render: () => null,
    src: 'https://example.com/logo.png',
  };

  const view = render(<ImageRenderer {...props} />);

  const image = view.container.querySelector('[data-tag="img"]')!;

  fireEvent(image, new CustomEvent('load', { detail: { width: 82, height: 24 } }));

  expect(image).toHaveStyle({ width: '82px' });

  view.rerender(<ImageRenderer {...props} style={{ width: '50%' }} />);

  expect(image).toHaveStyle({ width: '50%' });
});

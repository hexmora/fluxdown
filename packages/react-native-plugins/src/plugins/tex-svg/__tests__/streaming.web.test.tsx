import { act, cleanup, render, waitFor } from '@testing-library/react';

import { Fluxdown } from '../../../../../react-native/src/packs/full';
import { TexPlugin } from '../../tex';

const build = { tex: true };
const streaming = { smooth: false, effect: false };

afterEach(cleanup);

test('renders the first Web formula without a raw TeX loading frame', async () => {
  const source = String.raw`$x+\frac{1}{2}+\sqrt{y}$`;
  const { container } = render(<Fluxdown build={build} streaming={streaming} text={source} />);

  expect(container.textContent).not.toMatch(/\\(?:frac|sqrt)|[{}$]/);

  await waitFor(() => {
    expect(container.querySelector('svg path')).not.toBeNull();
  });
});

test.each([
  String.raw`$x+\frac{a}{b}$`,
  String.raw`$x+\sqrt[3]{1+y^{2}}$`,
  String.raw`$x+\begin{pmatrix}1&2\\3&4\end{pmatrix}$`,
])('renders every repaired prefix through React Native Web: %s', async (source) => {
  const view = render(<Fluxdown build={build} streaming={streaming} text="" />);
  let prefix = '';

  for (const character of source) {
    prefix += character;

    view.rerender(<Fluxdown build={build} streaming={streaming} text={prefix} />);

    // Observe each committed Unicode prefix before appending more source.
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {});

    expect(view.container.textContent).not.toMatch(/\\(?:frac|sqrt|begin|end)|[{}$]/);

    if (prefix.length >= 2) {
      expect(view.container.querySelector('svg path')).not.toBeNull();
    }
  }

  view.rerender(<Fluxdown build={build} streaming={false} text={source} />);

  expect(view.container.querySelector('svg path')).not.toBeNull();
  expect(view.container.textContent).not.toContain(source.slice(1, -1));
});

test('withholds pending list digits while the existing item remains rendered', async () => {
  const source = '9. First\n10. Second';
  const view = render(<Fluxdown streaming={streaming} text="" />);

  for (let length = 1; length <= source.length; length += 1) {
    const prefix = source.slice(0, length);

    view.rerender(<Fluxdown streaming={streaming} text={prefix} />);

    // eslint-disable-next-line no-await-in-loop -- Check each character boundary separately.
    await act(async () => {});

    if (/\n\d+$/.test(prefix)) {
      expect(view.container.textContent).toContain('First');
      expect(view.container.textContent).not.toMatch(/(?:1|10)$/);
    }
  }

  expect(view.container.textContent).toContain('Second');
});

test.each([
  'Read [docs](https://example.test) now.',
  '| Name | Link |\n| --- | --- |\n| A | [docs](https://example.test) |',
])('keeps Markdown resource syntax hidden inside React Native Web: %s', async (source) => {
  const view = render(<Fluxdown streaming={streaming} text="" />);
  let prefix = '';

  for (const character of source) {
    prefix += character;

    view.rerender(<Fluxdown streaming={streaming} text={prefix} />);

    // eslint-disable-next-line no-await-in-loop -- Check each character boundary separately.
    await act(async () => {});

    expect(view.container.textContent).not.toMatch(/https:|\[docs|---|\|/);
  }

  expect(view.getByRole('link')).toHaveTextContent('docs');
});

test('keeps default repair with plain TeX and restores source when streaming ends', async () => {
  const source = String.raw`$x+\frac{a}{`;
  const view = render(<Fluxdown build={build} streaming={streaming} text={source} />);

  await act(async () => {});

  expect(view.container.querySelector('svg path')).not.toBeNull();

  view.rerender(<Fluxdown build={build} plugins={TexPlugin} streaming={streaming} text={source} />);

  await act(async () => {});

  expect(view.container.querySelector('svg')).toBeNull();
  expect(view.container.textContent).toContain('x+');
  expect(view.container.textContent).not.toContain('frac');

  view.rerender(<Fluxdown build={build} streaming={false} text={source} />);

  expect(view.container.textContent).toContain(source);
});

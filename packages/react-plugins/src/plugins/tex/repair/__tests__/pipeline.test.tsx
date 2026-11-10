import { act, cleanup, render, waitFor } from '@testing-library/react';

import { TexRepairPlugin } from '..';
import { TexPlugin } from '../..';
import { Fluxdown } from '../../../../../../react/src/packs/full';
import { TexKatexPlugin } from '../../../tex-katex';
import { katexTexToHtml } from '../../../tex-katex/engine';
import { TexMathjaxKatexPlugin } from '../../../tex-mathjax-katex';
import { texToSvg } from '../../../tex-mathjax-katex/engine';

const streaming = { smooth: false, effect: false };

const build = { tex: true };

afterEach(async () => {
  cleanup();

  await act(async () => {});
});

test.each([
  String.raw`$x+\frac{a}{b}$`,
  String.raw`$x+\bbox[5px]{y}$`,
  String.raw`前 $x$ 与 $y+\sqrt{2}$`,
  String.raw`\[x+\sqrt{2}\]`,
])(
  'passes valid repaired TeX to the actual renderer at each Unicode prefix: %s',
  async (source) => {
    const view = render(<Fluxdown build={build} streaming={streaming} text="" />);

    let prefix = '';

    for (const character of source) {
      prefix += character;

      view.rerender(<Fluxdown build={build} streaming={streaming} text={prefix} />);

      // eslint-disable-next-line no-await-in-loop -- Observe each committed prefix separately.
      await act(async () => {});

      expect(
        view.container.querySelector('[data-formula-error="true"], [data-mjx-error]'),
      ).toBeNull();

      for (const node of view.container.querySelectorAll('[data-tex]')) {
        const tex = node.getAttribute('data-tex') ?? '';

        const mode = node.getAttribute('data-mode') === 'display' ? 'display' : 'inline';

        expect(katexTexToHtml(tex, mode) ?? texToSvg(tex, mode)).not.toBeNull();
      }

      const visible = view.container.cloneNode(true) as HTMLElement;

      visible.querySelectorAll('math').forEach((node) => {
        node.remove();
      });

      expect(visible.textContent).not.toMatch(/\\(?:frac|bbox|sqrt)/);
    }

    await waitFor(() => {
      expect(view.container.querySelector('.katex, mjx-container')).not.toBeNull();
    });

    view.rerender(<Fluxdown build={build} streaming={false} text={source} />);

    expect(view.container.querySelector('.katex, mjx-container')).not.toBeNull();
  },
  15_000,
);

test('uses the selected pack engine and resets on pack, source, and ending changes', async () => {
  const source = String.raw`$x+\bbox[5px]{y}`;

  const view = render(<Fluxdown build={build} streaming={streaming} text={source} />);

  await waitFor(() => {
    expect(view.container.querySelector('mjx-container')).not.toBeNull();
  });

  expect(view.container.querySelector('[data-tex]')?.getAttribute('data-tex')).toBe(
    source.slice(1),
  );

  view.rerender(
    <Fluxdown build={build} plugins={TexKatexPlugin} streaming={streaming} text={source} />,
  );

  await waitFor(() => {
    expect(view.container.querySelector('[data-tex]')?.getAttribute('data-tex')).toBe('x+');
  });

  view.rerender(
    <Fluxdown build={build} plugins={TexMathjaxKatexPlugin} streaming={streaming} text={source} />,
  );

  await waitFor(() => {
    expect(view.container.querySelector('mjx-container')).not.toBeNull();
  });

  view.rerender(<Fluxdown build={build} streaming={streaming} text="$z+" />);

  await waitFor(() => {
    expect(view.container.querySelector('[data-tex]')?.getAttribute('data-tex')).toBe('z+');
  });

  view.rerender(<Fluxdown build={build} streaming={false} text="$z+" />);

  expect(view.container.textContent).toBe('$z+');

  view.rerender(<Fluxdown build={build} plugins={TexPlugin} streaming={streaming} text={source} />);

  expect(view.container.textContent).toContain(source.slice(1));
}, 15_000);

test('can disable only engine repair using the existing plugin configuration', async () => {
  const source = String.raw`$x+\frac{a}{`;

  const view = render(
    <Fluxdown
      build={build}
      plugins={{ repairs: [[TexRepairPlugin, { disabled: true }]] }}
      streaming={streaming}
      text={source}
    />,
  );

  await waitFor(() => {
    expect(view.container.textContent).toContain(source.slice(1));
  });
});

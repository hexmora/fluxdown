import type { Element } from 'hast';

import { cleanup, render } from '@lynx-js/react/testing-library';
import { afterEach, expect, test } from '@rstest/core';

import { TexSvgSlotPlugin } from '..';
import { createTypeOfSlot, resolveTheme, SlotProvider, ThemeProvider } from '../../../../../base';
import { TexSlotPlugin } from '../../../../tex';

const Tex = createTypeOfSlot('Tex');

const node: Element = { type: 'element', tagName: 'span', properties: {}, children: [] };

const nodeProps = { current: node, parents: [], render: () => null };

afterEach(cleanup);

test('uses the Lynx SVG content attribute and updates color and layout with props', () => {
  const content = (tex: string, mode: 'display' | 'inline', dark: boolean) => (
    <ThemeProvider value={resolveTheme(dark ? 'dark' : 'light')}>
      <SlotProvider plugins={[TexSlotPlugin, TexSvgSlotPlugin]}>
        <Tex {...nodeProps} tex={tex} mode={mode} />
      </SlotProvider>
    </ThemeProvider>
  );

  const view = render(content(String.raw`\frac{1}{2}`, 'inline', false));

  expect(view.container.querySelector('svg')?.getAttribute('content')).toContain('<path');
  expect(view.container.querySelector('svg')?.getAttribute('accessibility-label')).toBe(
    String.raw`\frac{1}{2}`,
  );
  expect(view.container.querySelector('scroll-view')).toBeNull();

  const previous = view.container.querySelector('svg')?.getAttribute('content');

  view.rerender(content(String.raw`\sqrt{x}`, 'display', true));

  expect(view.container.querySelector('scroll-view')).not.toBeNull();
  expect(view.container.querySelector('svg')?.getAttribute('content')).not.toBe(previous);
  expect(view.container.querySelector('svg')?.getAttribute('content')).toContain('color="#ececf1"');
  expect(view.container.querySelector('svg')?.getAttribute('style')).toMatch(/width:\s*[\d.]+em/);
  expect(view.container.querySelector('span, div, mjx-container')).toBeNull();
});

test('falls back to TeX source and recovers when a streamed formula becomes valid', () => {
  const content = (tex: string) => (
    <SlotProvider plugins={[TexSlotPlugin, TexSvgSlotPlugin]}>
      <Tex {...nodeProps} tex={tex} />
    </SlotProvider>
  );

  const view = render(content(String.raw`\frac{1`));

  expect(view.container.querySelector('svg')).toBeNull();
  expect(view.container.textContent).toBe(String.raw`\frac{1`);

  view.rerender(content(String.raw`\frac{1}{2}`));

  expect(view.container.querySelector('svg')?.getAttribute('content')).toContain('<path');
});

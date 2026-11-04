import { mount } from '@vue/test-utils';

import { TexMathjaxKatexRenderer } from '..';
import { renderKatexFormula } from '../../../../../../base/math';
import { TexKatexRenderer } from '../../../../../tex-katex/slot/tex-katex/renderer';

test('inherits the surrounding text color and size for native SVG formulas', () => {
  const wrapper = mount(TexKatexRenderer, {
    props: { tex: 'x^2' },
    attrs: { style: { color: '#123456', fontSize: '24px' } },
  });

  const image = wrapper.get<HTMLElement>('image');

  const svg = decodeURIComponent(image.attributes('src')?.split(',')[1] ?? '');

  expect(svg).toContain('color="#123456"');

  expect(Number.parseFloat(image.element.style.width)).toBeCloseTo(
    renderKatexFormula('x^2', 'inline', 24, '#123456')!.width,
  );
});

test('uses the MathJax fallback only when KaTeX cannot parse the formula', async () => {
  const source = '\\ce{H2O}';

  const katex = mount(TexKatexRenderer, { props: { tex: source } });

  expect(katex.find('image').exists()).toBe(false);

  expect(katex.text()).toBe(source);

  const hybrid = mount(TexMathjaxKatexRenderer, { props: { tex: source } });

  expect(hybrid.find('image').exists()).toBe(true);

  await hybrid.setProps({ tex: '\\frac{' });

  expect(hybrid.find('image').exists()).toBe(false);

  expect(hybrid.text()).toBe('\\frac{');
});

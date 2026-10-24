import type { Element } from 'hast';

import { render } from '@testing-library/react';

import { TexRenderer } from '../renderer';

const current: Element = { type: 'element', tagName: 'span', properties: {}, children: [] };
const nodeProps = { Raw: null, current, parents: [], render: () => null };

describe('source TeX rendering', () => {
  test('renders literal LaTeX safely in inline and display modes', () => {
    const tex = String.raw`\frac{1}{2}<script>source</script>`;
    const { container, rerender } = render(<TexRenderer {...nodeProps} tex={tex} />);

    expect(container.firstElementChild?.tagName).toBe('SPAN');
    expect(container.textContent).toBe(tex);
    expect(container.querySelector('script, .katex, svg')).toBeNull();

    rerender(<TexRenderer {...nodeProps} className="display-tex" mode="display" tex={tex} />);
    expect(container.firstElementChild?.tagName).toBe('DIV');
    expect(container.firstElementChild).toHaveClass('display-tex');
    expect(container.textContent).toBe(tex);
  });
});

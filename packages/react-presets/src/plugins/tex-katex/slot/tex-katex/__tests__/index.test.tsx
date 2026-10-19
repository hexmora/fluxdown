import type { Element } from 'hast';

import { render, waitFor } from '@testing-library/react';

import { TexKatexRenderer } from '../renderer';

const current: Element = { type: 'element', tagName: 'span', properties: {}, children: [] };
const nodeProps = { Raw: null, current, parents: [], render: () => null };

describe('KaTeX-only rendering', () => {
  test('loads KaTeX lazily and keeps unsupported expressions as source', async () => {
    const { container, rerender } = render(<TexKatexRenderer {...nodeProps} tex="x^2" />);

    expect(container.textContent).toBe('x^2');
    await waitFor(() => expect(container.querySelector('.katex')).not.toBeNull());

    const tex = String.raw`\bbox[5px]{x}`;
    rerender(<TexKatexRenderer {...nodeProps} mode="display" tex={tex} />);

    expect(container.textContent).toBe(tex);
    expect(container.firstElementChild?.tagName).toBe('DIV');
    expect(container.querySelector('.katex, svg')).toBeNull();
  });
});

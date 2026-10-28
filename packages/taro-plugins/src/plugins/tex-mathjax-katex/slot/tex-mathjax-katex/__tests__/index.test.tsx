import type { Element } from 'hast';

import { fireEvent, render, waitFor } from '@testing-library/react';

import { TextColorProvider } from '../../../../../base';
import { BlockquoteRenderer } from '../../../../blockquote/slot/blockquote/renderer';
import { LinkRenderer } from '../../../../link/slot/link/renderer';
import { TexMathjaxKatexRenderer } from '../renderer';
import { MathjaxTexRenderer } from '../renderer/components/mathjax-tex';

const node: Element = {
  type: 'element',
  tagName: 'span',
  properties: {},
  children: [],
};

const nodeProps = { Raw: null, current: node, parents: [], render: () => null };

const getSvg = (container: HTMLElement) => {
  const image = container.querySelector('img')!;

  return decodeURIComponent(image.src.slice(image.src.indexOf(',') + 1));
};

describe('KaTeX and MathJax fallback', () => {
  test('keeps supported formulas in KaTeX without an image', async () => {
    const { container } = render(<TexMathjaxKatexRenderer {...nodeProps} tex="x^2" />);

    await waitFor(() => expect(container.querySelector('.katex')).not.toBeNull());

    expect(container.querySelector('img')).toBeNull();
  });

  test.each(['inline', 'display'] as const)(
    'falls back to a MathJax image for %s formulas',
    async (mode) => {
      const { container } = render(
        <TexMathjaxKatexRenderer {...nodeProps} mode={mode} tex={String.raw`\bbox[5px]{x}`} />,
      );

      await waitFor(() => expect(container.querySelector('img')).not.toBeNull(), {
        timeout: 15000,
      });

      expect(container.querySelector('[data-mode]')).toHaveAttribute('data-mode', mode);

      expect(container.querySelector('.katex')).toBeNull();

      expect(getSvg(container)).toContain('<svg');
    },
  );

  test('renders invalid formulas as text instead of a broken image', async () => {
    const tex = String.raw`\unsupportedfluxdowncommand`;

    const { container } = render(<TexMathjaxKatexRenderer {...nodeProps} tex={tex} />);

    await waitFor(() => expect(container).toHaveTextContent(tex));

    expect(container.querySelector('img, svg, .katex')).toBeNull();
  });

  test('keeps display spacing and source styling when MathJax rejects a formula', () => {
    const tex = String.raw`\unsupportedfluxdowncommand`;

    const { container } = render(<MathjaxTexRenderer {...nodeProps} mode="display" tex={tex} />);

    expect(container.firstElementChild).toHaveAttribute('data-mode', 'display');

    expect(container.firstElementChild).toHaveAttribute('data-formula-error', 'true');

    expect(container).toHaveTextContent(tex);

    expect(container.querySelector('img')).toBeNull();
  });

  test('uses theme and slot colors while preserving explicit TeX colors', async () => {
    const tex = String.raw`\bbox[5px]{\color{red}{x}+y}`;

    const { container, rerender } = render(
      <TextColorProvider value="#ececf1">
        <MathjaxTexRenderer {...nodeProps} tex={tex} />
      </TextColorProvider>,
    );

    await waitFor(() => expect(container.querySelector('img')).not.toBeNull());

    expect(getSvg(container)).toContain('color="#ececf1"');

    expect(getSvg(container)).toContain('fill="red"');

    rerender(
      <TextColorProvider value="#202123">
        <MathjaxTexRenderer {...nodeProps} tex={tex} style={{ color: '#123456' }} />
      </TextColorProvider>,
    );

    await waitFor(() => expect(getSvg(container)).toContain('color="#123456"'));
  });

  test('inherits quote and nested link colors from the same theme', async () => {
    const tex = String.raw`\bbox[5px]{x}`;

    const { container } = render(
      <TextColorProvider value="#ececf1" muted="#b0b1b3" accent="#8ab4ff">
        <BlockquoteRenderer {...nodeProps}>
          <MathjaxTexRenderer {...nodeProps} tex={tex} />
          <LinkRenderer {...nodeProps} href="https://example.com">
            <MathjaxTexRenderer {...nodeProps} tex={tex} />
          </LinkRenderer>
        </BlockquoteRenderer>
      </TextColorProvider>,
    );

    await waitFor(() => expect(container.querySelectorAll('img')).toHaveLength(2));

    expect(getSvg(container.querySelector('[data-tag="blockquote"]')!)).toContain(
      'color="#b0b1b3"',
    );

    expect(getSvg(container.querySelector('[data-tag="a"]')!)).toContain('color="#8ab4ff"');
  });

  test('recovers after an image error when the formula changes', async () => {
    const tex = String.raw`\bbox[5px]{x}`;

    const { container, rerender } = render(<MathjaxTexRenderer {...nodeProps} tex={tex} />);

    await waitFor(() => expect(container.querySelector('img')).not.toBeNull());

    fireEvent.error(container.querySelector('img')!);

    await waitFor(() => expect(container).toHaveTextContent(tex));

    expect(container.querySelector('img')).toBeNull();

    rerender(<MathjaxTexRenderer {...nodeProps} tex={String.raw`\bbox[5px]{y}`} />);

    await waitFor(() => expect(container.querySelector('img')).not.toBeNull());

    fireEvent.load(container.querySelector('img')!);

    rerender(<MathjaxTexRenderer {...nodeProps} tex={tex} />);

    await waitFor(() => expect(container.querySelector('img')).not.toBeNull());
  });
});

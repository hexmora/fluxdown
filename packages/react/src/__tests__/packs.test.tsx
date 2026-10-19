import type { ParagraphProps, ReactRenderParams } from '@fluxdown/react-presets/base';

import { CodeHeaderSlotPlugin, CodePlugin } from '@fluxdown/react-presets/plugins/code';
import { FallbackPlugin } from '@fluxdown/react-presets/plugins/fallback';
import {
  ParagraphPlugin,
  ParagraphRenderPlugin,
  ParagraphSlotPlugin,
} from '@fluxdown/react-presets/plugins/paragraph';
import { PluginPriority } from '@fluxdown/types';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';

import type { FluxdownRef, IPluginItem } from '../packs/full';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';

class CustomParagraphRenderPlugin extends ParagraphRenderPlugin {
  render({ renderChildren }: ReactRenderParams) {
    return <section data-testid="custom-render">{renderChildren()}</section>;
  }
}

class LaterParagraphRenderPlugin extends ParagraphRenderPlugin {
  render({ renderChildren }: ReactRenderParams) {
    return <aside data-testid="later-render">{renderChildren()}</aside>;
  }
}

class CustomParagraphSlotPlugin {
  static readonly key = 'slot-paragraph';

  readonly type = 'Paragraph';

  readonly config = {};

  readonly Component = ({ Raw, ...props }: ParagraphProps) => (
    <section data-testid="custom-slot">{Raw ? <Raw {...props} /> : props.children}</section>
  );

  destroy() {}
}

describe('React packs', () => {
  test('raw installs only the supplied React plugins', () => {
    const { container, rerender } = render(<FluxdownRaw plugins={[]} text="content" />);

    expect(container.firstElementChild).toBeEmptyDOMElement();

    rerender(<FluxdownRaw plugins={FallbackPlugin} text="content" />);

    expect(container.querySelector('p')).toHaveTextContent('content');
    expect(container.querySelector('p')?.className).toBe('');

    rerender(<FluxdownRaw plugins={[ParagraphPlugin, FallbackPlugin]} text="content" />);

    expect(container.querySelector('p')?.className).not.toBe('');
  });

  test('lite renders code and LaTeX source without a highlighting or formula engine', () => {
    const { container } = render(
      <FluxdownLite build={{ tex: true }} text={'```ts\nconst answer = 42;\n```\n\n$x + y$'} />,
    );

    expect(container.querySelector('pre code')).toHaveTextContent('const answer = 42;');
    expect(container).toHaveTextContent('x + y');
    expect(container.querySelector('.shiki, .katex, mjx-container')).toBeNull();
  });

  test.each([
    { name: 'raw', Component: FluxdownRaw },
    { name: 'lite', Component: FluxdownLite },
    { name: 'full', Component: Fluxdown },
  ])('$name applies disable and re-enable overrides across user packs', ({ Component }) => {
    const disabled: IPluginItem = { slots: [[CodeHeaderSlotPlugin, { disabled: true }]] };
    const text = '```text\nsource\n```';
    const { container, rerender } = render(<Component plugins={[CodePlugin]} text={text} />);

    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();

    rerender(<Component plugins={[CodePlugin, disabled]} text={text} />);

    expect(screen.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument();
    expect(container.querySelector('pre code')).toHaveTextContent('source');

    rerender(
      <Component plugins={[CodePlugin, disabled, { slots: [CodeHeaderSlotPlugin] }]} text={text} />,
    );

    expect(screen.getAllByRole('button', { name: 'Copy' })).toHaveLength(1);
    expect(container.querySelector('pre code')).toHaveTextContent('source');

    rerender(<Component plugins={[CodePlugin, disabled, CodePlugin, disabled]} text={text} />);

    expect(screen.queryByRole('button', { name: 'Copy' })).not.toBeInTheDocument();
  });

  describe.each([
    { name: 'lite', Component: FluxdownLite },
    { name: 'full', Component: Fluxdown },
  ])('$name', ({ Component }) => {
    test('matches a user renderer before a preset with the same priority', () => {
      const { container } = render(
        <Component plugins={{ renders: [CustomParagraphRenderPlugin] }} text="custom" />,
      );

      expect(screen.getByTestId('custom-render')).toHaveTextContent('custom');
      expect(container.querySelector('p')).toBeNull();
    });

    test('uses the last matching user renderer and follows changes to pack order', () => {
      const { rerender } = render(
        <Component
          plugins={[
            { renders: [CustomParagraphRenderPlugin] },
            { renders: [LaterParagraphRenderPlugin] },
          ]}
          text="custom"
        />,
      );

      expect(screen.getByTestId('later-render')).toHaveTextContent('custom');
      expect(screen.queryByTestId('custom-render')).not.toBeInTheDocument();

      rerender(
        <Component
          plugins={[
            { renders: [LaterParagraphRenderPlugin] },
            { renders: [CustomParagraphRenderPlugin] },
          ]}
          text="custom"
        />,
      );

      expect(screen.getByTestId('custom-render')).toHaveTextContent('custom');
      expect(screen.queryByTestId('later-render')).not.toBeInTheDocument();
    });

    test('keeps explicit priority stronger than declaration order', () => {
      const { container, rerender } = render(
        <Component
          plugins={{
            renders: [
              [CustomParagraphRenderPlugin, { priority: PluginPriority.High }],
              [LaterParagraphRenderPlugin, { priority: PluginPriority.Low }],
            ],
          }}
          text="priority"
        />,
      );

      expect(screen.getByTestId('custom-render')).toHaveTextContent('priority');
      expect(screen.queryByTestId('later-render')).not.toBeInTheDocument();

      rerender(
        <Component
          plugins={{ renders: [[LaterParagraphRenderPlugin, { priority: PluginPriority.Low }]] }}
          text="priority"
        />,
      );

      expect(container.querySelector('p')).toHaveTextContent('priority');
      expect(screen.queryByTestId('later-render')).not.toBeInTheDocument();
    });

    test('composes user slots outside the preset and removes disabled defaults', () => {
      const { container, rerender } = render(
        <Component plugins={{ slots: [CustomParagraphSlotPlugin] }} text="composed" />,
      );

      expect(screen.getByTestId('custom-slot')).toContainElement(container.querySelector('p'));

      rerender(
        <Component
          plugins={{
            config: { 'slot-paragraph': { disabled: true } },
            slots: [ParagraphSlotPlugin],
          }}
          text="composed"
        />,
      );

      expect(screen.queryByTestId('custom-slot')).not.toBeInTheDocument();
      expect(container.querySelector('p')).toBeNull();

      rerender(
        <Component
          plugins={{ renders: [[ParagraphRenderPlugin, { disabled: true }]] }}
          text="composed"
        />,
      );

      expect(container.querySelector('p')).toHaveTextContent('composed');
      expect(container.querySelector('p')?.className).toBe('');

      rerender(<Component text="composed" />);

      expect(container.querySelector('p')?.className).not.toBe('');
    });

    test('forwards the core ref through updates and destroys it on unmount', () => {
      const ref = createRef<FluxdownRef>();
      const { rerender, unmount } = render(<Component ref={ref} text="first" />);
      const closure = ref.current;

      expect(closure).not.toBeNull();

      rerender(<Component ref={ref} text="second" />);

      expect(ref.current).toBe(closure);
      expect(screen.getByText('second')).toBeInTheDocument();

      unmount();

      expect(ref.current).toBeNull();
    });
  });
});

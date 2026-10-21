import type { ParagraphProps } from '@fluxdown/react-base-presets/base';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';
import { PRESET_RENDER_PLUGINS } from '@fluxdown/react-base-presets/render';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';

import type { BaseFluxdownRef, IPluginItem } from '../types';

import { BaseFluxdown } from '..';
import { MOCK_PRESET_SLOT_PLUGINS, MockNodeSlotPlugin, MockParagraphSlotPlugin } from './plugins';

const configuredSlots = (testID: string): IPluginItem => ({
  renders: PRESET_RENDER_PLUGINS,
  slots: [MockNodeSlotPlugin, [MockParagraphSlotPlugin, { testID }]],
});

describe('BaseFluxdown', () => {
  test('installs only explicitly supplied render plugins', () => {
    const view = render(<BaseFluxdown text="content" />);

    expect(view.container).toBeEmptyDOMElement();
  });

  test.each([false, true])('renders platform-free slot output with a single pack=%s', (single) => {
    const pack = { renders: PRESET_RENDER_PLUGINS, slots: MOCK_PRESET_SLOT_PLUGINS };

    const view = render(<BaseFluxdown text={'first\n\nsecond'} plugins={single ? pack : [pack]} />);

    expect([...view.container.children].map((node) => node.tagName)).toEqual(['P', 'P']);
  });

  test('omits a named slot when no implementation was supplied', () => {
    const view = render(
      <BaseFluxdown text="paragraph" plugins={{ renders: PRESET_RENDER_PLUGINS }} />,
    );

    expect(view.container).toBeEmptyDOMElement();
  });

  test('switches plugin pack forms and updates configuration without replacing the Core', () => {
    const ref = createRef<BaseFluxdownRef>();

    const view = render(
      <BaseFluxdown ref={ref} text="content" plugins={configuredSlots('first')} />,
    );

    const core = ref.current;

    expect(screen.getByTestId('first')).toHaveTextContent('content');

    const paragraph = screen.getByTestId('first');

    view.rerender(<BaseFluxdown ref={ref} text="content" plugins={[configuredSlots('first')]} />);

    expect(screen.getByTestId('first')).toBe(paragraph);

    view.rerender(<BaseFluxdown ref={ref} text="content" plugins={[configuredSlots('second')]} />);

    expect(ref.current).toBe(core);

    expect(screen.queryByTestId('first')).not.toBeInTheDocument();

    expect(screen.getByTestId('second')).toHaveTextContent('content');
  });

  test('applies slot overrides in plugin pack order', () => {
    class Paragraph extends BaseSlotPlugin<'Paragraph'> {
      static readonly key = 'base-caller-paragraph';

      readonly type = 'Paragraph';

      readonly Component = ({ children }: ParagraphProps) => <p data-testid="custom">{children}</p>;
    }

    render(
      <BaseFluxdown
        text="custom"
        plugins={[
          { renders: PRESET_RENDER_PLUGINS, slots: MOCK_PRESET_SLOT_PLUGINS },
          { slots: [Paragraph] },
        ]}
      />,
    );

    expect(screen.getByTestId('custom')).toHaveTextContent('custom');
  });
});

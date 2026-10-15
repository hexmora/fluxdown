import type { ParagraphProps } from '@fluxdown/react-base-presets/base';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';

import type { BaseFluxdownRef, IPluginItem } from '../types';

import { BaseFluxdown } from '..';
import { MOCK_PRESET_SLOT_PLUGINS, MockNodeSlotPlugin, MockParagraphSlotPlugin } from './plugins';

const configuredSlots = (testID: string): IPluginItem[] => [
  { slots: [MockNodeSlotPlugin, [MockParagraphSlotPlugin, { testID }]] },
];

describe('BaseFluxdown', () => {
  test('renders slot output without introducing a platform container', () => {
    const view = render(
      <BaseFluxdown text={'first\n\nsecond'} plugins={[{ slots: MOCK_PRESET_SLOT_PLUGINS }]} />,
    );

    expect([...view.container.children].map((node) => node.tagName)).toEqual(['P', 'P']);
  });

  test('reports a missing required slot when no slots were supplied', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      expect(() => {
        render(<BaseFluxdown text="paragraph" />);
      }).toThrow('The Paragraph slot is required.');
    } finally {
      error.mockRestore();
    }
  });

  test('updates slot configuration without replacing the Core', () => {
    const ref = createRef<BaseFluxdownRef>();

    const view = render(
      <BaseFluxdown ref={ref} text="content" plugins={configuredSlots('first')} />,
    );

    const core = ref.current;

    expect(screen.getByTestId('first')).toHaveTextContent('content');

    view.rerender(<BaseFluxdown ref={ref} text="content" plugins={configuredSlots('second')} />);

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
        plugins={[{ slots: MOCK_PRESET_SLOT_PLUGINS }, { slots: [Paragraph] }]}
      />,
    );

    expect(screen.getByTestId('custom')).toHaveTextContent('custom');
  });
});

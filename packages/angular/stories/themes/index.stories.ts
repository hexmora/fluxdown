import type { Meta, StoryObj } from '@storybook/angular';

import type { FluxdownProps } from '../../src/packs/full';

import { Fluxdown } from '../../src/packs/full';
import { THEME_MARKDOWN } from './consts';

const meta = {
  component: Fluxdown,
  args: {
    text: THEME_MARKDOWN,
    build: { footnote: true, tex: true },
  },
  parameters: { layout: 'padded' },
  title: 'Themes',
} satisfies Meta<FluxdownProps>;

export default meta;

type Story = StoryObj<FluxdownProps>;

export const Light: Story = { args: { theme: 'light' } };

export const Dark: Story = { args: { theme: 'dark' } };

export const Custom: Story = {
  args: {
    theme: [
      'light',
      { tokens: { colors: { accent: '#7252c7' }, typography: { fontSize: { md: '18px' } } } },
    ],
  },
};

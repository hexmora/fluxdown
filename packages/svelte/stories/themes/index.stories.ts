import type { Meta, StoryObj } from '@storybook/svelte-vite';

import { Fluxdown } from '@fluxdown/svelte';

import { STORY_MARKDOWN } from '../playgrounds/consts';

const meta = {
  component: Fluxdown,
  title: 'Themes',
  args: {
    text: STORY_MARKDOWN,
    build: { tex: true, footnote: true },
    style: 'padding: 32px; max-width: 800px; margin: auto',
  },
} satisfies Meta<typeof Fluxdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Light: Story = { args: { theme: 'light' } };

export const Dark: Story = { args: { theme: 'dark' } };

export const Custom: Story = {
  args: {
    theme: [
      'light',
      {
        tokens: {
          colors: { accent: '#0f766e' },
          typography: { fontSize: { md: '17px' } },
          paragraph: { marginBottom: '18px' },
        },
      },
    ],
  },
};

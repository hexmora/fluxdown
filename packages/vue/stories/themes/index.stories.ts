import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { h } from 'vue';

import type { FluxdownProps } from '../../src/packs/full';

import { Fluxdown } from '../../src/packs/full';
import { THEME_MARKDOWN } from './consts';

const meta = {
  args: {
    build: { footnote: true, tex: true },
    text: THEME_MARKDOWN,
  },
  render: (args) => {
    return {
      setup() {
        return () => {
          return h(Fluxdown, args);
        };
      },
    };
  },
  parameters: {
    layout: 'padded',
  },
  title: 'Themes',
} satisfies Meta<FluxdownProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Light: Story = {
  args: { theme: 'light' },
};

export const Dark: Story = {
  args: { theme: 'dark' },
};

export const Custom: Story = {
  args: {
    theme: {
      tokens: {
        colors: {
          accent: '#0f766e',
          accentHover: '#115e59',
          bg: '#fffdf7',
          border: '#e7e1d4',
          borderEmphasis: '#b0beb4',
          surfaceMuted: '#efeee5',
          surfaceSubtle: '#f6f5ed',
        },
        heading: {
          h1: { fontSize: '2.5rem', fontWeight: 600, lineHeight: 1.2 },
        },
        typography: {
          fontSans: "Georgia, 'Times New Roman', serif",
          lineHeight: { md: 1.8 },
        },
      },
    },
  },
};

export const DarkCustom: Story = {
  args: {
    theme: [
      'dark',
      {
        tokens: {
          colors: { accent: '#c4b5fd', accentHover: '#ddd6fe' },
          heading: { h1: { fontSize: '2.5rem' } },
          radius: { lg: '1.25rem' },
          syntax: { keyword: '#c4b5fd', function: '#f0abfc' },
        },
      },
    ],
  },
};

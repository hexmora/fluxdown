import type { Meta, StoryObj } from '@storybook/svelte-vite';

import { Playground } from '../components/playground';
import { STORY_MARKDOWN } from './consts';

const meta = {
  component: Playground,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Playgrounds',
  args: {
    text: STORY_MARKDOWN,
    streaming: false,
    pack: 'full',
    effect: 'scale',
    smooth: true,
    theme: 'light',
  },
  argTypes: {
    text: { control: 'text' },
    streaming: { control: 'boolean' },
    pack: { control: 'select', options: ['full', 'lite', 'raw'] },
    effect: { control: 'select', options: ['none', 'scale', 'shad', 'chunk', 'suffix'] },
    smooth: { control: 'boolean' },
    theme: { control: 'select', options: ['light', 'dark'] },
  },
} satisfies Meta<typeof Playground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Full: Story = {};

export const Lite: Story = { args: { pack: 'lite' } };

export const Raw: Story = { args: { pack: 'raw' } };

export const Scale: Story = { args: { streaming: true, effect: 'scale' } };

export const Shad: Story = { args: { streaming: true, effect: 'shad' } };

export const Chunk: Story = { args: { streaming: true, effect: 'chunk', smooth: false } };

export const Suffix: Story = { args: { streaming: true, effect: 'suffix' } };

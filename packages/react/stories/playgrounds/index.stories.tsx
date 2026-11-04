import type { Meta, StoryObj } from '@storybook/react-vite';

import { PatchPlayground } from '../components/patch-playground';
import { Playground } from '../components/playground';
import { SmoothStreaming } from '../components/smooth-streaming';
import { STORY_MARKDOWN } from './consts';

const meta = {
  component: Playground,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Playgrounds',
} satisfies Meta<typeof Playground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialText: STORY_MARKDOWN,
  },
};

export const Patch: Story = {
  render: () => <PatchPlayground />,
};

export const Smooth: Story = {
  render: () => <SmoothStreaming />,
};

/** The streaming lab with the per-character scale entrance selected. */
export const Scale: Story = {
  render: () => <SmoothStreaming initialSettings={{ effect: 'scale' }} title="Scale typing" />,
};

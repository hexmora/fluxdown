import type { Meta, StoryObj } from 'storybook-solidjs-vite';

import type { FluxdownProps } from '../../src/packs/full';

import { Fluxdown } from '../../src/packs/full';
import { PatchPlayground } from '../components/patch-playground';
import { SmoothStreaming } from '../components/smooth-streaming';
import { STORY_MARKDOWN } from './consts';
import { CompactCodePlugin } from './plugins';

const meta = {
  args: {
    build: { footnote: true, tex: true },
    text: STORY_MARKDOWN,
  },
  render: (args) => {
    return <Fluxdown {...args} />;
  },
  parameters: {
    layout: 'padded',
  },
  title: 'Playgrounds',
} satisfies Meta<FluxdownProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Slot: Story = {
  args: { plugins: CompactCodePlugin },
};

export const Patch: Story = {
  render: () => {
    return <PatchPlayground />;
  },
};

export const Scale: Story = {
  render: (args) => {
    return <SmoothStreaming initialText={args.text} effect="scale" />;
  },
};

export const Shad: Story = {
  render: (args) => {
    return <SmoothStreaming initialText={args.text} effect="shad" />;
  },
};

export const Chunk: Story = {
  render: (args) => {
    return <SmoothStreaming initialText={args.text} effect="chunk" />;
  },
};

export const Suffix: Story = {
  render: (args) => {
    return <SmoothStreaming initialText={args.text} effect="suffix" />;
  },
};

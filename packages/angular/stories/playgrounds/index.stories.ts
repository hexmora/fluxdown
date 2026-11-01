import type { Meta, StoryObj } from '@storybook/angular';

import { createElement } from '@fluxdown/angular-plugins/base';
import { moduleMetadata } from '@storybook/angular';

import type { FluxdownProps } from '../../src/packs/full';

import { Fluxdown } from '../../src/packs/full';
import { SmoothStreaming } from '../components/smooth-streaming';
import { STORY_MARKDOWN } from './consts';

const meta = {
  component: Fluxdown,
  args: {
    text: STORY_MARKDOWN,
    build: { footnote: true, tex: true },
  },
  decorators: [moduleMetadata({ imports: [SmoothStreaming] })],
  parameters: { layout: 'padded' },
  title: 'Playgrounds',
} satisfies Meta<FluxdownProps>;

export default meta;

type Story = StoryObj<FluxdownProps>;

export const Default: Story = {};

export const Patch: Story = {
  args: {
    text: 'Hello world',
    patches: [{ key: 'word', range: [6, 11], render: (text) => createElement('mark', {}, text) }],
  },
};

export const Scale: Story = {
  render: (args) => {
    return {
      props: args,
      template: '<story-smooth-streaming [initialText]="text" effect="scale" />',
    };
  },
};

export const Shad: Story = {
  render: (args) => {
    return {
      props: args,
      template: '<story-smooth-streaming [initialText]="text" effect="shad" />',
    };
  },
};

export const Chunk: Story = {
  render: (args) => {
    return {
      props: args,
      template: '<story-smooth-streaming [initialText]="text" effect="chunk" />',
    };
  },
};

export const Suffix: Story = {
  render: (args) => {
    return {
      props: args,
      template: '<story-smooth-streaming [initialText]="text" effect="suffix" />',
    };
  },
};

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Fluxdown } from '../../src/packs/full';
import { FluxdownLite } from '../../src/packs/lite';
import { StreamingPreview } from '../components/streaming-preview';
import { MARKDOWN } from './consts';

const meta: Meta<typeof Fluxdown> = {
  title: 'Taro/Fluxdown',
  component: Fluxdown,
  args: { text: MARKDOWN, build: { tex: true } },
};

export default meta;

type Story = StoryObj<typeof Fluxdown>;

export const Static: Story = {};

export const Dark: Story = { args: { theme: 'dark' } };

export const Lite: Story = {
  render: (props) => {
    return <FluxdownLite {...props} />;
  },
};

export const Scale: Story = {
  render: (props) => {
    return <StreamingPreview {...props} effect="scale" />;
  },
};

export const Shad: Story = {
  render: (props) => {
    return <StreamingPreview {...props} effect="shad" />;
  },
};

export const Suffix: Story = {
  render: (props) => {
    return <StreamingPreview {...props} effect="suffix" />;
  },
};

export const Chunk: Story = {
  render: (props) => {
    return <StreamingPreview {...props} effect="chunk" />;
  },
};

export const CustomTheme: Story = {
  args: { theme: ['light', { tokens: { colors: { fg: '#123456' } } }] },
};

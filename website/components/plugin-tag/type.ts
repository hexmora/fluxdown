import type { PLUGIN_TAG_LABELS } from './consts';

export type PluginTagProps = {
  type: keyof typeof PLUGIN_TAG_LABELS;
};

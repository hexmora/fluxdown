import type { PluginTagProps } from './type';

import { PLUGIN_TAG_LABELS } from './consts';
import styles from './index.module.scss';

export const PluginTag = ({ type }: PluginTagProps) => (
  <span className={styles.tag} data-type={type}>
    {PLUGIN_TAG_LABELS[type]}
  </span>
);

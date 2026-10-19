import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { FluxdownLite } from 'fluxdown/lite';

import { getDemoTheme } from '../../utils';
import { SAMPLE } from './consts';
import styles from './index.module.scss';

export const PackDemo = ({ variant }: { variant: 'lite' | 'full' }) => {
  const dark = useDark();

  const Component = variant === 'lite' ? FluxdownLite : Fluxdown;

  return (
    <div className={styles.preview} data-demo={variant}>
      <Component build={{ tex: true }} text={SAMPLE} theme={getDemoTheme(dark)} />
    </div>
  );
};

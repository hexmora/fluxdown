import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';

import type { AnimationDemoProps } from './type';

import { useLocale } from '../../../hooks';
import { useDemoStream } from '../../hooks';
import { getDemoTheme } from '../../utils';
import { StreamingFrame } from '../streaming-frame';
import { COPY } from './consts';
import styles from './index.module.scss';

export const AnimationDemo = ({ effect }: AnimationDemoProps) => {
  const { lang } = useLocale();

  const labels = COPY[lang];

  const dark = useDark();

  const stream = useDemoStream(labels.source);

  return (
    <div className={styles.animation} ref={stream.containerRef}>
      <StreamingFrame caption={labels[effect]} controls={stream} label={labels[effect]}>
        <div className={styles.preview}>
          <Fluxdown
            key={stream.cycle}
            streaming={stream.reducedMotion ? false : { smooth: true, repairEnding: true, effect }}
            text={stream.text}
            theme={getDemoTheme(dark)}
          />
        </div>
      </StreamingFrame>
    </div>
  );
};

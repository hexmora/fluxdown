import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useState } from 'react';

import { useLocale } from '../../../hooks';
import { getDemoTheme } from '../../utils';
import { StreamingFrame } from '../streaming-frame';
import { COPY } from './consts';
import styles from './index.module.scss';
import { StreamingIndicatorRepairPlugin } from './plugin';

export const RepairPluginDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  const [streaming, setStreaming] = useState(true);

  return (
    <div className={styles.demo} data-demo="repair-plugin">
      <StreamingFrame label={labels.title}>
        <div className={styles.controls}>
          {[true, false].map((value) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={streaming === value}
              onClick={() => setStreaming(value)}
            >
              {value ? labels.streaming : labels.complete}
            </button>
          ))}
        </div>
        <div className={styles.results}>
          {[false, true].map((custom) => (
            <section
              key={String(custom)}
              aria-label={custom ? labels.custom : labels.builtIn}
              data-custom={custom}
            >
              <h4>{custom ? labels.custom : labels.builtIn}</h4>
              <div className={`${styles.preview} rp-not-doc`}>
                <Fluxdown
                  text={labels.source}
                  plugins={custom ? { repairs: [StreamingIndicatorRepairPlugin] } : undefined}
                  streaming={streaming ? { smooth: false, effect: false } : false}
                  theme={getDemoTheme(dark)}
                />
              </div>
            </section>
          ))}
        </div>
      </StreamingFrame>
    </div>
  );
};

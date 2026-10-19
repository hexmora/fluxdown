import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useState } from 'react';

import type { SuffixDemoSample, SuffixDemoType } from './type';

import { useLocale } from '../../../hooks';
import { useDemoStream } from '../../hooks';
import { getDemoTheme } from '../../utils';
import { StreamingFrame } from '../streaming-frame';
import { StreamingPreview } from '../streaming-preview';
import { COPY } from './consts';
import styles from './index.module.scss';
import { SmileRenderPlugin } from './renderer';

export const SuffixDemo = () => {
  const { lang } = useLocale();

  const labels = COPY[lang];

  const dark = useDark();

  const [type, setType] = useState<SuffixDemoType>('cursor');

  const [sample, setSample] = useState<SuffixDemoSample>('paragraph');

  const [customRenderer, setCustomRenderer] = useState(false);

  const stream = useDemoStream(labels.samples[sample].source);

  return (
    <div className={styles.suffix} data-demo="suffix" ref={stream.containerRef}>
      <StreamingFrame caption={labels.caption} controls={stream} label={labels.label}>
        <div className={styles.options}>
          <label className={styles.field}>
            {labels.type}
            <span className={styles.select}>
              <select
                aria-label={labels.type}
                onChange={(event) => setType(event.target.value as SuffixDemoType)}
                value={type}
              >
                <option value="cursor">{labels.cursor}</option>
                <option value="dot">{labels.dot}</option>
                <option value="smile">{labels.custom}</option>
              </select>
            </span>
          </label>
          <label className={styles.field}>
            {labels.sample}
            <span className={styles.select}>
              <select
                aria-label={labels.sample}
                onChange={(event) => setSample(event.target.value as SuffixDemoSample)}
                value={sample}
              >
                {Object.entries(labels.samples).map(([value, item]) => (
                  <option key={value} value={value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </span>
          </label>
        </div>
        {type === 'smile' && (
          <div className={styles.custom}>
            <label>
              <input
                aria-label={labels.customRenderer}
                checked={customRenderer}
                onChange={(event) => setCustomRenderer(event.target.checked)}
                type="checkbox"
              />
              {labels.customRenderer}
            </label>
          </div>
        )}
        <div data-suffix-preview={sample}>
          <StreamingPreview label={labels.label} reducedMotion={stream.reducedMotion}>
            <Fluxdown
              key={stream.cycle}
              plugins={{ renders: customRenderer ? [SmileRenderPlugin] : [] }}
              streaming={{ smooth: !stream.reducedMotion, effect: ['suffix', { type }] }}
              text={stream.text}
              theme={getDemoTheme(dark)}
            />
          </StreamingPreview>
        </div>
        <p className={styles.note}>{labels.inspect}</p>
      </StreamingFrame>
    </div>
  );
};

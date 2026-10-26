import { Fluxdown as FluxdownNative } from '@fluxdown/react-native';
import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useState } from 'react';

import type { DemoEffect, DemoMode } from './type';

import { useLocale } from '../../../hooks';
import { useDemoStream } from '../../hooks';
import { StreamingFrame } from '../streaming-frame';
import { BUILD, COPY, EFFECTS, THEMES } from './consts';
import styles from './index.module.scss';

export const NativeDemo = () => {
  const { lang } = useLocale();

  const labels = COPY[lang];

  const dark = useDark();

  const stream = useDemoStream(labels.source);

  const [mode, setMode] = useState<DemoMode>('static');

  const [effect, setEffect] = useState<DemoEffect>('scale');

  const text = mode === 'static' ? labels.source : stream.text;

  const streaming = mode === 'streaming' &&
    !stream.complete &&
    !stream.reducedMotion && {
      effect,
      smooth: effect !== 'chunk',
    };

  const theme = THEMES[dark ? 'dark' : 'light'];

  return (
    <div data-demo="react-native" ref={stream.containerRef}>
      <StreamingFrame
        controls={{
          ...stream,
          complete: mode === 'static' || stream.complete,
          playing: mode === 'streaming' && stream.playing,
          replay: () => {
            setMode('streaming');

            stream.replay();
          },
        }}
        label={labels.title}
      >
        <div className={styles.options}>
          {(['static', 'streaming'] as const).map((value) => (
            <button
              aria-pressed={mode === value}
              key={value}
              onClick={() => {
                setMode(value);

                if (value === 'streaming') {
                  stream.replay();
                }
              }}
              type="button"
            >
              {labels[value]}
            </button>
          ))}
          <label>
            {labels.effect}
            <select
              onChange={(event) => setEffect(event.target.value as DemoEffect)}
              value={effect}
            >
              {EFFECTS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.comparison}>
          <section aria-label="React" className={styles.panel} data-renderer="react">
            <h3 className={styles.label}>React</h3>
            <div className={styles.content}>
              <Fluxdown
                build={BUILD}
                key={stream.cycle}
                streaming={streaming}
                text={text}
                theme={theme}
              />
            </div>
          </section>
          <section aria-label={labels.native} className={styles.panel} data-renderer="native">
            <h3 className={styles.label}>{labels.native}</h3>
            <div className={styles.content}>
              <FluxdownNative
                build={BUILD}
                key={stream.cycle}
                streaming={streaming}
                text={text}
                theme={theme}
              />
            </div>
          </section>
        </div>
      </StreamingFrame>
    </div>
  );
};

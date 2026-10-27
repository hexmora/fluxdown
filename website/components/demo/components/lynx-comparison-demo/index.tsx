import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useMemo, useState } from 'react';

import type { DemoEffect } from '../../../../lynx/type';
import type { DemoMode } from './type';

import { useLocale } from '../../../hooks';
import { useDemoStream } from '../../hooks';
import { StreamingFrame } from '../streaming-frame';
import { LynxPreview } from './components';
import { COPY, EFFECTS, THEMES } from './consts';
import styles from './index.module.scss';

export const LynxComparisonDemo = () => {
  const { lang } = useLocale();

  const labels = COPY[lang];

  const dark = useDark();

  const stream = useDemoStream(labels.source);

  const [mode, setMode] = useState<DemoMode>('static');

  const [effect, setEffect] = useState<DemoEffect>('scale');

  const text = mode === 'static' ? labels.source : stream.text;

  const pending = mode === 'streaming' && !stream.complete && !stream.reducedMotion;

  const streaming = pending && { effect, smooth: effect !== 'chunk' };

  const data = useMemo(
    () => ({
      text,
      streaming: pending,
      effect,
      smooth: effect !== 'chunk',
      dark,
      cycle: stream.cycle,
    }),
    [text, pending, effect, dark, stream.cycle],
  );

  return (
    <div data-demo="lynx" ref={stream.containerRef}>
      <StreamingFrame
        caption={labels.title}
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
              onChange={(event) => {
                setEffect(event.target.value as DemoEffect);

                if (mode === 'streaming') {
                  stream.replay();
                }
              }}
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
                key={stream.cycle}
                streaming={streaming}
                text={text}
                theme={THEMES[dark ? 'dark' : 'light']}
              />
            </div>
          </section>
          <section aria-label="Lynx" className={styles.panel} data-renderer="lynx">
            <h3 className={styles.label}>Lynx</h3>
            <LynxPreview data={data} errorLabel={labels.error} />
          </section>
        </div>
      </StreamingFrame>
    </div>
  );
};

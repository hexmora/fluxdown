import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useState } from 'react';

import { useLocale } from '../../../hooks';
import { ReplayIcon } from '../../../icons';
import { useDemoStream } from '../../hooks';
import { getDemoTheme } from '../../utils';
import { StreamAccelerator } from '../stream-accelerator';
import { COPY, DRIVERS, INTERPOLATORS, TIMING } from './consts';
import styles from './index.module.scss';
import { SteadyDriver } from './strategies';

const SmoothingControlsDemo = ({ mode }: { mode: 'driver' | 'interpolation' }) => {
  const { lang } = useLocale();
  const dark = useDark();
  const labels = COPY[lang];
  const stream = useDemoStream(labels.source, TIMING);
  const [selection, setSelection] = useState(1);
  const isDriver = mode === 'driver';
  const options = isDriver ? [50, 160, 320] : [1, 2, 4];
  const unit = isDriver ? 'ms' : labels.units;
  const customLabel = `${options[selection]} ${unit}`;

  const baseline = {
    enabled: true,
    driver: isDriver ? ('raf' as const) : SteadyDriver,
    interpolation: 'spring' as const,
  };
  const custom = {
    enabled: true,
    driver: isDriver ? DRIVERS[selection]! : SteadyDriver,
    interpolation: isDriver ? ('spring' as const) : INTERPOLATORS[selection]!,
  };

  return (
    <section
      aria-label={isDriver ? labels.driverLabel : labels.interpolationLabel}
      className={styles.demo}
      data-demo={mode}
      ref={stream.containerRef}
    >
      <div className={styles.toolbar}>
        <label>
          {isDriver ? labels.driver : labels.interpolation}
          <span className={styles.select}>
            <select
              onChange={(event) => {
                setSelection(Number(event.target.value));
                stream.replay();
              }}
              value={selection}
            >
              {options.map((option, index) => (
                <option key={option} value={index}>
                  {option} {unit}
                </option>
              ))}
            </select>
          </span>
        </label>
        <button aria-label={labels.replay} onClick={stream.replay} type="button">
          <ReplayIcon />
          {labels.replay}
        </button>
      </div>
      <div className={styles.received}>
        <span>{labels.received}</span>
        <progress
          aria-label={labels.received}
          value={stream.text.length}
          max={labels.source.length}
        />
        <span aria-hidden="true">
          {Math.round((stream.text.length / labels.source.length) * 100)}%
        </span>
      </div>
      <StreamAccelerator
        className={styles.comparison}
        onAdvance={stream.advance}
        onReplay={stream.replay}
        complete={stream.complete}
      >
        {[
          { id: 'baseline', label: isDriver ? labels.raf : labels.spring, smooth: baseline },
          { id: 'custom', label: customLabel, smooth: custom },
        ].map(({ id, label, smooth }) => (
          <div className={styles.panel} key={id}>
            <div className={styles.label}>{label}</div>
            <Fluxdown
              key={`${stream.cycle}-${selection}`}
              streaming={stream.reducedMotion ? false : { smooth, effect: false }}
              text={stream.text}
              theme={getDemoTheme(dark)}
            />
          </div>
        ))}
      </StreamAccelerator>
      <p className={styles.note}>{isDriver ? labels.driverNote : labels.interpolationNote}</p>
    </section>
  );
};

export const DriverDemo = () => <SmoothingControlsDemo mode="driver" />;

export const InterpolationDemo = () => <SmoothingControlsDemo mode="interpolation" />;

import {
  RafSmoothTicker,
  SpringSmoothScheduler,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';

import { useLocale } from '../../../hooks';
import { useDemoStream } from '../../hooks';
import { StreamingFrame } from '../streaming-frame';
import { COPY, TIMING } from './consts';
import { useTimingCursor } from './hooks';
import styles from './index.module.scss';
import { ReadingTicker, SteadyScheduler } from './timing';

export const TimingDemo = ({ mode }: { mode: 'ticker' | 'scheduler' }) => {
  const { lang } = useLocale();

  const labels = COPY[lang];

  const stream = useDemoStream(lang === 'zh' ? '甲乙丙丁' : '1234', TIMING);

  const source = labels.chunks.join('');

  const text = labels.chunks.slice(0, stream.text.length).join('');

  const params = { ...stream, source, text };

  const first = useTimingCursor({
    ...params,
    Ticker: RafSmoothTicker,
    Scheduler: mode === 'ticker' ? SteadyScheduler : SpringSmoothScheduler,
  });

  const second = useTimingCursor({
    ...params,
    Ticker: mode === 'ticker' ? ReadingTicker : RafSmoothTicker,
    Scheduler: SteadyScheduler,
  });

  const complete = Math.min(first, second) >= source.length;

  const lanes = [
    { title: mode === 'ticker' ? labels.raf : labels.spring, cursor: first },
    { title: mode === 'ticker' ? labels.interval : labels.steady, cursor: second },
  ];

  return (
    <div className={styles.timing} data-demo={mode} ref={stream.containerRef}>
      <StreamingFrame
        caption={mode === 'ticker' ? labels.tickerTitle : labels.schedulerTitle}
        controls={{ ...stream, complete, playing: stream.active && !complete }}
        label={mode === 'ticker' ? labels.tickerTitle : labels.schedulerTitle}
      >
        <div className={styles.legend}>
          <span className={styles.received}>{labels.received}</span>
          <span>{labels.visible}</span>
        </div>
        <div className={styles.lanes}>
          {lanes.map(({ title, cursor }) => (
            <section aria-label={title} className={styles.lane} key={title}>
              <div className={styles.heading}>
                <strong>{title}</strong>
                <span>{Math.round((cursor / source.length) * 100)}%</span>
              </div>
              <div aria-hidden="true" className={styles.track}>
                <span
                  className={styles.target}
                  style={{ width: `${(text.length / source.length) * 100}%` }}
                />
                <span style={{ width: `${(cursor / source.length) * 100}%` }} />
              </div>
              <div aria-label={source} className={styles.text}>
                <span aria-hidden="true">{source.slice(0, cursor)}</span>
                <span aria-hidden="true" className={styles.pending}>
                  {source.slice(cursor)}
                </span>
              </div>
            </section>
          ))}
        </div>
      </StreamingFrame>
    </div>
  );
};

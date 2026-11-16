import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useEffect, useState } from 'react';

import { useLocale } from '../../../hooks';
import { getDemoTheme } from '../../utils';
import { StreamingFrame } from '../streaming-frame';
import { COPY, SAMPLES } from './consts';
import styles from './index.module.scss';

export const RepairDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  const length = Math.max(...SAMPLES.map((sample) => Array.from(sample.source).length));
  const [cursor, setCursor] = useState(12);
  const [speed, setSpeed] = useState(12);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (!playing || ended) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (cursor >= length) {
        setPlaying(false);
        setEnded(true);
        return;
      }

      setCursor((value) => value + 1);
    }, 1000 / speed);

    return () => window.clearTimeout(timer);
  }, [playing, ended, cursor, length, speed]);

  return (
    <div className={styles.demo} data-demo="syntax-repair">
      <StreamingFrame label={labels.title}>
        <div className={styles.controls}>
          <button type="button" disabled={ended} onClick={() => setPlaying((value) => !value)}>
            {playing ? labels.pause : labels.play}
          </button>
          <button
            type="button"
            onClick={() => {
              setCursor(0);
              setEnded(false);
              setPlaying(true);
            }}
          >
            {labels.replay}
          </button>
          <button
            type="button"
            disabled={ended || cursor === length}
            onClick={() => {
              setPlaying(false);
              setCursor((value) => value + 1);
            }}
          >
            {labels.step}
          </button>
          <button
            type="button"
            disabled={ended}
            onClick={() => {
              setPlaying(false);
              setEnded(true);
            }}
          >
            {labels.finish}
          </button>
          <label>
            {labels.speed}
            <select value={speed} onChange={(event) => setSpeed(Number(event.currentTarget.value))}>
              {[4, 12, 24, 48].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className={styles.progress}>
          {labels.position}
          <input
            aria-label={labels.position}
            type="range"
            min={0}
            max={length}
            value={cursor}
            onChange={(event) => {
              setCursor(Number(event.currentTarget.value));
              setPlaying(false);
              setEnded(false);
            }}
          />
          <output>
            {cursor} / {length}
          </output>
        </label>
        <p className={styles.status}>{ended ? labels.done : labels.pending}</p>
        <div className={styles.results}>
          <div className={styles.headings}>
            {[labels.raw, labels.off, labels.on].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          {SAMPLES.map((sample) => {
            const text = Array.from(sample.source).slice(0, cursor).join('');

            return (
              <div className={styles.row} key={sample.id}>
                <section
                  className={styles.source}
                  aria-label={`${sample.label[lang]} · ${labels.raw}`}
                >
                  <h4>{sample.label[lang]}</h4>
                  <pre>
                    <code>{text || ' '}</code>
                  </pre>
                </section>
                {[false, true].map((repair) => (
                  <section
                    key={String(repair)}
                    aria-label={`${sample.label[lang]} · ${repair ? labels.on : labels.off}`}
                    data-repair={repair}
                  >
                    <div className={`${styles.preview} rp-not-doc`}>
                      <Fluxdown
                        text={text}
                        build={{ repair, tex: true }}
                        streaming={
                          ended ? false : { smooth: false, effect: false, repairEnding: true }
                        }
                        theme={getDemoTheme(dark)}
                      />
                    </div>
                  </section>
                ))}
              </div>
            );
          })}
        </div>
        <p className={styles.status}>{labels.hint}</p>
      </StreamingFrame>
    </div>
  );
};

import type { BlockquoteProps } from '@fluxdown/react-plugins/base';

import { BaseSlotPlugin } from '@fluxdown/react-plugins/base';
import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { Fragment, useState } from 'react';

import { useLocale } from '../../../hooks';
import { useDemoStream } from '../../hooks';
import { getDemoTheme } from '../../utils';
import { StreamAccelerator } from '../stream-accelerator';
import { StreamingFrame } from '../streaming-frame';
import { COPY, TIMING } from './consts';
import styles from './index.module.scss';

export const RepairTourDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  const [progress, setProgress] = useState(55);

  return (
    <div data-demo="tour-repair">
      <StreamingFrame label={labels.repair}>
        <label className={styles.progress}>
          {labels.progress}
          <input
            aria-label={labels.progress}
            type="range"
            min={0}
            max={100}
            step="any"
            value={progress}
            onChange={(event) => setProgress(Number(event.currentTarget.value))}
          />
        </label>
        <div className={styles.repairScroll}>
          <div className={styles.repairGrid}>
            {[labels.source, labels.plain, labels.repaired].map((label) => (
              <div className={styles.repairHeading} key={label}>
                {label}
              </div>
            ))}
            {labels.samples.map((sample) => {
              const text = sample.text.slice(0, Math.floor((sample.text.length * progress) / 100));
              return (
                <Fragment key={sample.label}>
                  <section
                    className={styles.repairSource}
                    aria-label={`${sample.label} · ${labels.source}`}
                  >
                    <span>{sample.label}</span>
                    <code>{text}</code>
                  </section>
                  <section
                    className={styles.repairResult}
                    aria-label={`${sample.label} · ${labels.plain}`}
                  >
                    <Fluxdown text={text} build={{ repair: false }} theme={getDemoTheme(dark)} />
                  </section>
                  <section
                    className={styles.repairResult}
                    aria-label={`${sample.label} · ${labels.repaired}`}
                  >
                    <Fluxdown
                      text={text}
                      streaming={{ smooth: false, effect: false, repairEnding: true }}
                      theme={getDemoTheme(dark)}
                    />
                  </section>
                </Fragment>
              );
            })}
          </div>
        </div>
      </StreamingFrame>
    </div>
  );
};

export const SmoothTourDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  const stream = useDemoStream(labels.stream, TIMING);
  const [effect, setEffect] = useState<'scale' | 'shad' | 'suffix' | 'none'>('scale');

  return (
    <div data-demo="tour-smooth" ref={stream.containerRef}>
      <StreamingFrame label={labels.smooth} caption={labels.smooth} controls={stream}>
        <label className={styles.options}>
          {labels.effect}
          <span className={styles.select}>
            <select
              aria-label={labels.effect}
              value={effect}
              onChange={(event) => {
                setEffect(event.target.value as typeof effect);
                stream.replay();
              }}
            >
              <option value="scale">{labels.scale}</option>
              <option value="shad">{labels.shad}</option>
              <option value="suffix">{labels.suffix}</option>
              <option value="none">{labels.none}</option>
            </select>
          </span>
        </label>
        <div className={styles.columns}>
          <StreamAccelerator
            className={`${styles.result} ${styles.streaming}`}
            label={labels.incoming}
            onAdvance={stream.advance}
            onReplay={stream.replay}
            complete={stream.complete}
          >
            <span className={styles.label}>{labels.incoming}</span>
            <Fluxdown
              key={stream.cycle}
              text={stream.text}
              streaming={{ smooth: false, effect: false }}
              theme={getDemoTheme(dark)}
            />
          </StreamAccelerator>
          <section className={`${styles.result} ${styles.streaming}`} aria-label={labels.smoothed}>
            <span className={styles.label}>{labels.smoothed}</span>
            <Fluxdown
              key={stream.cycle}
              text={stream.text}
              streaming={
                stream.reducedMotion
                  ? false
                  : { smooth: true, effect: effect === 'none' ? false : effect }
              }
              theme={getDemoTheme(dark)}
            />
          </section>
        </div>
      </StreamingFrame>
    </div>
  );
};

const Note = ({ children }: BlockquoteProps) => {
  const { lang } = useLocale();

  return (
    <aside className={styles.note}>
      <strong>{COPY[lang].note}</strong>
      {children}
    </aside>
  );
};

class NotePlugin extends BaseSlotPlugin<'Blockquote'> {
  static readonly key = 'tour-note';
  readonly type = 'Blockquote';
  readonly Component = Note;
}

const NOTE_PLUGINS = { slots: [NotePlugin] };

export const SlotTourDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  const [custom, setCustom] = useState(true);

  return (
    <div data-demo="tour-slots">
      <StreamingFrame label={labels.slots}>
        <fieldset className={styles.options} aria-label={labels.slots}>
          <button type="button" aria-pressed={!custom} onClick={() => setCustom(false)}>
            {labels.default}
          </button>
          <button type="button" aria-pressed={custom} onClick={() => setCustom(true)}>
            {labels.custom}
          </button>
        </fieldset>
        <div className={styles.quote}>
          <Fluxdown
            plugins={custom ? NOTE_PLUGINS : undefined}
            text={labels.quote}
            theme={getDemoTheme(dark)}
          />
        </div>
      </StreamingFrame>
    </div>
  );
};

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Each scrollable preview supports keyboard navigation. */
import { useDark } from '@rspress/core/runtime';
import { useState } from 'react';

import type { PreviewEffect, Renderer } from '../renderer-preview';
import type { RendererPanelProps } from './type';

import { useBottomScroll } from '../../../bottom-scroll';
import { useLocale } from '../../../hooks';
import { DEMO_BUILD } from '../../consts';
import { useDemoStream } from '../../hooks';
import { getStreamSample } from '../../utils';
import { RendererPreview, RENDERERS } from '../renderer-preview';
import { StreamingControls } from '../streaming-controls';
import { StreamingFrame } from '../streaming-frame';
import { COPY, EFFECTS, MODES } from './consts';
import styles from './index.module.scss';

const RendererPanel = ({ label, ...props }: RendererPanelProps) => {
  const scroll = useBottomScroll(props.reducedMotion ?? false);

  return (
    <section aria-label={label} className={styles.panel} data-renderer={props.renderer}>
      <h2 className={styles.label}>{label}</h2>
      {props.renderer === 'lynx' ? (
        <div className={styles.lynx}>
          <RendererPreview {...props} />
        </div>
      ) : (
        <section
          aria-label={label}
          className={styles.viewport}
          ref={scroll.viewportRef}
          tabIndex={0}
        >
          <div className={styles.content} ref={scroll.contentRef}>
            <RendererPreview {...props} />
          </div>
        </section>
      )}
    </section>
  );
};

export const RendererDemo = () => {
  const { lang } = useLocale();

  const labels = COPY[lang];

  const dark = useDark();

  const source = getStreamSample(lang);

  const stream = useDemoStream(source);

  const [mode, setMode] = useState<'static' | 'streaming'>('streaming');

  const [effect, setEffect] = useState<PreviewEffect>('scale');

  const [selected, setSelected] = useState<Renderer[]>(() => RENDERERS.map(({ value }) => value));

  const text = mode === 'static' ? source : stream.text;

  const streaming = mode === 'streaming' &&
    !stream.complete &&
    !stream.reducedMotion && {
      effect,
      smooth: effect !== 'chunk',
      repairEnding: true,
    };

  return (
    <div className={styles.demo} data-demo="renderers" ref={stream.containerRef}>
      <StreamingFrame label={labels.label}>
        <div className={styles.options}>
          <div className={styles.modes}>
            {MODES.map((value) => (
              <button
                aria-pressed={mode === value}
                key={value}
                onClick={() => {
                  setMode(value);

                  if (value === 'streaming') stream.replay();
                }}
                type="button"
              >
                {labels[value]}
              </button>
            ))}
          </div>
          <fieldset aria-label={labels.renderers} className={styles.renderers}>
            {RENDERERS.map(({ value, label }) => (
              <button
                aria-pressed={selected.includes(value)}
                key={value}
                onClick={() => {
                  setSelected((current) => {
                    return current.includes(value)
                      ? current.filter((item) => item !== value)
                      : [...current, value];
                  });
                }}
                type="button"
              >
                {label}
              </button>
            ))}
          </fieldset>
          <div className={styles.actions}>
            <label className={styles.effect}>
              <span className={styles.effectLabel}>{labels.effect}</span>
              <span className={styles.select}>
                <select
                  aria-label={labels.effect}
                  value={effect}
                  onChange={(event) => {
                    setEffect(event.currentTarget.value as PreviewEffect);

                    if (mode === 'streaming') stream.replay();
                  }}
                >
                  {EFFECTS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <StreamingControls
              controls={{
                ...stream,
                complete: mode === 'static' || stream.complete,
                playing: mode === 'streaming' && stream.playing,
                replay: () => {
                  setMode('streaming');

                  stream.replay();
                },
              }}
            />
          </div>
        </div>
        {selected.length > 0 ? (
          <section aria-label={labels.scroll} className={styles.row} tabIndex={0}>
            {RENDERERS.filter(({ value }) => selected.includes(value)).map(({ value, label }) => (
              <RendererPanel
                build={DEMO_BUILD}
                cycle={stream.cycle}
                dark={dark}
                key={value}
                label={label}
                reducedMotion={!!stream.reducedMotion}
                renderer={value}
                streaming={streaming}
                text={text}
              />
            ))}
          </section>
        ) : (
          <output className={styles.empty}>{labels.empty}</output>
        )}
        <div className={styles.footer}>{labels.hint}</div>
      </StreamingFrame>
    </div>
  );
};

import type { IPatchItem } from '@fluxdown/core';
import type { ReactNode } from 'react';

import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useMemo, useState } from 'react';

import { useLocale } from '../../../hooks';
import { useDemoStream } from '../../hooks';
import { getDemoTheme } from '../../utils';
import { StreamingFrame } from '../streaming-frame';
import { COPY } from './consts';
import styles from './index.module.scss';

export const PatchStaticDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  const [enabled, setEnabled] = useState(true);
  const [detail, setDetail] = useState<'city' | 'citation' | null>(null);

  const patches = useMemo(() => {
    const start = labels.source.indexOf(labels.city);

    return [
      {
        key: 'place',
        range: [start, start + labels.city.length],
        render: (text) => (
          <button className={styles.place} onClick={() => setDetail('city')} type="button">
            <span aria-hidden="true" className={styles.dot} />
            {text}
          </button>
        ),
      },
      {
        key: 'source-1',
        range: labels.source.length,
        render: () => (
          <button
            aria-label={`${labels.sourceLabel} 1`}
            className={styles.citation}
            onClick={() => setDetail('citation')}
            type="button"
          >
            1
          </button>
        ),
      },
    ] satisfies IPatchItem<ReactNode>[];
  }, [labels]);

  return (
    <section aria-label={labels.staticLabel} className={styles.demo} data-demo="patch-static">
      <div className={styles.toolbar}>
        <span>{labels.staticCaption}</span>
        <fieldset aria-label={labels.staticCaption} className={styles.options}>
          {[false, true].map((value) => (
            <button
              aria-pressed={enabled === value}
              key={String(value)}
              onClick={() => {
                setEnabled(value);
                setDetail(null);
              }}
              type="button"
            >
              {value ? labels.patched : labels.original}
            </button>
          ))}
        </fieldset>
      </div>
      <div className={styles.preview}>
        <Fluxdown
          patches={enabled ? patches : []}
          text={labels.source}
          theme={getDemoTheme(dark)}
        />
      </div>
      <div aria-live="polite" className={styles.detail}>
        {enabled && detail ? (
          <>
            <strong>{detail === 'city' ? labels.cityTitle : labels.citationTitle}</strong>
            <span>{detail === 'city' ? labels.cityDetail : labels.citationDetail}</span>
          </>
        ) : (
          <span>{enabled ? labels.hint : labels.originalHint}</span>
        )}
      </div>
    </section>
  );
};

export const PatchStreamingDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  const stream = useDemoStream(labels.streamSource);
  const [selected, setSelected] = useState<{ cycle: number; index: number } | null>(null);

  const patches = useMemo(() => {
    const first = labels.firstSentence.length;
    const positions = [first, first + labels.secondSentence.length];

    return positions.map((range, index) => ({
      key: `source-${index + 1}`,
      range,
      render: () => (
        <button
          aria-label={`${labels.sourceLabel} ${index + 1}`}
          className={styles.citation}
          onClick={() => setSelected({ cycle: stream.cycle, index })}
          type="button"
        >
          {index + 1}
        </button>
      ),
    }));
  }, [labels, stream.cycle]);

  const available = patches.filter((patch) => patch.range <= stream.text.length);
  const selectedSource =
    selected?.cycle === stream.cycle ? labels.streamSources[selected.index] : undefined;

  return (
    <div className={styles.streaming} data-demo="patch-streaming" ref={stream.containerRef}>
      <StreamingFrame caption={labels.streamCaption} controls={stream} label={labels.streamLabel}>
        <div className={styles.preview}>
          <Fluxdown
            key={stream.cycle}
            patches={available}
            streaming={stream.reducedMotion ? false : { smooth: true }}
            text={stream.text}
            theme={getDemoTheme(dark)}
          />
        </div>
        <div aria-live="polite" className={styles.detail}>
          {selectedSource ? (
            <>
              <strong>{selectedSource.title}</strong>
              <span>{selectedSource.detail}</span>
            </>
          ) : (
            <span>{labels.streamHint}</span>
          )}
        </div>
      </StreamingFrame>
    </div>
  );
};

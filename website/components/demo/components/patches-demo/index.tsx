import type { IPatchItem } from '@fluxdown/core';
import type { ReactNode } from 'react';

import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useId, useMemo, useState } from 'react';

import { useLocale } from '../../../hooks';
import { useDemoStream } from '../../hooks';
import { getDemoTheme } from '../../utils';
import { StreamingFrame } from '../streaming-frame';
import { COPY, STREAM_TIMING } from './consts';
import styles from './index.module.scss';

export const StaticPatchesDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  const detailId = useId();
  const [enabled, setEnabled] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const start = labels.staticSource.indexOf('@Ada');
  const patches = useMemo<IPatchItem<ReactNode>[]>(
    () => [
      {
        key: 'person-ada',
        range: [start, start + '@Ada'.length],
        render: (text) => (
          <button
            aria-controls={detailId}
            aria-expanded={expanded}
            aria-label={labels.personLabel}
            className={styles.person}
            onClick={() => setExpanded((current) => !current)}
            type="button"
          >
            {text}
          </button>
        ),
      },
    ],
    [detailId, expanded, labels.personLabel, start],
  );

  return (
    <div className={styles.patches} data-demo="patches-static">
      <StreamingFrame label={labels.staticLabel}>
        <div className={styles.toolbar}>
          <span>{labels.staticLabel}</span>
          <label className={styles.toggle}>
            <input
              aria-label={labels.enabled}
              checked={enabled}
              onChange={(event) => {
                setEnabled(event.target.checked);
                setExpanded(false);
              }}
              type="checkbox"
            />
            {labels.enabled}
          </label>
        </div>
        <div className={styles.source}>
          <span>{labels.original}</span>
          <code>{labels.staticSource}</code>
        </div>
        <div className={styles.preview}>
          <Fluxdown
            patches={enabled ? patches : []}
            text={labels.staticSource}
            theme={getDemoTheme(dark)}
          />
        </div>
        <div className={styles.detail} hidden={!enabled || !expanded} id={detailId}>
          <strong>Ada</strong>
          <span>{labels.personRole}</span>
          <p>{labels.personDetail}</p>
        </div>
      </StreamingFrame>
    </div>
  );
};

export const StreamingPatchesDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  const detailId = useId();
  const [expanded, setExpanded] = useState(false);
  const stream = useDemoStream(labels.streamSource, STREAM_TIMING);
  const point = labels.streamSource.indexOf(labels.citationAnchor) + labels.citationAnchor.length;
  const ready = stream.text.length >= point;
  const patches = useMemo<IPatchItem<ReactNode>[]>(
    () => [
      {
        key: 'source-1',
        range: point,
        render: () => (
          <button
            aria-controls={detailId}
            aria-expanded={expanded}
            aria-label={labels.citationLabel}
            className={styles.citation}
            onClick={() => setExpanded((current) => !current)}
            type="button"
          >
            [1]
          </button>
        ),
      },
    ],
    [detailId, expanded, labels.citationLabel, point],
  );

  return (
    <div className={styles.patches} data-demo="patches-streaming" ref={stream.containerRef}>
      <StreamingFrame
        caption={labels.streamCaption}
        controls={{
          ...stream,
          replay: () => {
            setExpanded(false);
            stream.replay();
          },
        }}
        label={labels.streamLabel}
      >
        <div className={`${styles.preview} ${styles.streaming}`}>
          <Fluxdown
            key={stream.cycle}
            patches={patches}
            streaming={{ smooth: false, effect: false }}
            text={stream.text}
            theme={getDemoTheme(dark)}
          />
        </div>
        <p className={styles.status}>{ready ? labels.ready : labels.pending}</p>
        <div className={styles.detail} hidden={!ready || !expanded} id={detailId}>
          <strong>{labels.referenceTitle}</strong>
          <p>{labels.referenceDetail}</p>
        </div>
      </StreamingFrame>
    </div>
  );
};

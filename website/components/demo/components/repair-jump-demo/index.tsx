import {
  CodeHeaderSlotPlugin,
  CodeHighlighterSlotPlugin,
} from '@fluxdown/react-plugins/plugins/code';
import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useRef } from 'react';

import { useLocale } from '../../../hooks';
import { getDemoTheme } from '../../utils';
import { StreamAccelerator } from '../stream-accelerator';
import { StreamingFrame } from '../streaming-frame';
import { COPY } from './consts';
import { useFollowScroll, useJumpStream } from './hooks';
import styles from './index.module.scss';
import { SCENARIOS } from './scenarios';

export const RepairJumpDemo = () => {
  const { lang } = useLocale();
  const dark = useDark();
  const labels = COPY[lang];
  const {
    preview,
    stream,
    report,
    text,
    length,
    ready,
    speed,
    setSpeed,
    restart,
    toggle,
    step,
    advance,
  } = useJumpStream();
  const log = useRef<HTMLDivElement>(null);
  const onLogScroll = useFollowScroll(log, report.events.length, stream.run);
  const onPreviewScroll = useFollowScroll(preview, report.frames, stream.run);
  const rate = report.frames ? (report.jumpFrames / report.frames) * 100 : 0;
  const roles: Record<string, string> = {
    plain: labels.plain,
    hidden: labels.hidden,
    unseen: labels.unseen,
  };

  return (
    <div className={`${styles.demo} rp-not-doc`} data-demo="repair-jump">
      <StreamingFrame label={labels.title}>
        <div className={styles.controls}>
          <label className={styles.select}>
            <span>{labels.scenario}</span>
            <select
              value={stream.scenario}
              onChange={(event) => restart({ scenario: Number(event.currentTarget.value) })}
            >
              {SCENARIOS.map((scenario, index) => (
                <option key={scenario.test.id} value={index}>
                  {scenario.label[lang]}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.select}>
            <span>{labels.speed}</span>
            <select value={speed} onChange={(event) => setSpeed(Number(event.currentTarget.value))}>
              {[6, 12, 24, 48].map((value) => (
                <option key={value} value={value}>
                  {value / 12}×
                </option>
              ))}
            </select>
          </label>
          <button type="button" disabled={stream.complete} onClick={toggle}>
            {stream.playing ? labels.pause : labels.play}
          </button>
          <button type="button" onClick={() => restart()}>
            {labels.replay}
          </button>
          <button
            type="button"
            disabled={stream.playing || !ready || stream.complete}
            onClick={step}
          >
            {stream.cursor === length ? labels.finish : labels.step}
          </button>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              aria-label={labels.repair}
              checked={stream.repair}
              onChange={(event) => restart({ repair: event.currentTarget.checked })}
            />
            {labels.repair}
          </label>
        </div>
        <div className={styles.summary}>
          <output aria-label={labels.progress}>
            {stream.cursor} / {length}
          </output>
          <output aria-label={labels.rate}>
            {labels.rate} · {report.jumpFrames} / {report.frames} · {rate.toFixed(2)}%
          </output>
        </div>
        <div className={styles.columns}>
          <section aria-label={labels.preview}>
            <h4>{labels.preview}</h4>
            <StreamAccelerator
              label={labels.preview}
              onAdvance={advance}
              onReplay={() => restart()}
              complete={stream.complete}
            >
              <div ref={preview} className={styles.preview} onScroll={onPreviewScroll}>
                <Fluxdown
                  key={stream.run}
                  text={text}
                  plugins={{
                    slots: [
                      [CodeHeaderSlotPlugin, { disabled: true }],
                      [CodeHighlighterSlotPlugin, { disabled: true }],
                    ],
                  }}
                  build={{
                    repair: stream.repair,
                    tex: false,
                    footnote: false,
                    indentedCode: true,
                    setextHeading: true,
                  }}
                  streaming={
                    stream.complete ? false : { smooth: false, effect: false, repairEnding: true }
                  }
                  theme={getDemoTheme(dark)}
                />
              </div>
            </StreamAccelerator>
          </section>
          <section aria-label={labels.events}>
            <h4>{labels.events}</h4>
            <div
              ref={log}
              className={styles.events}
              onScroll={onLogScroll}
              role="log"
              aria-live="off"
              // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keep the scrollable event history keyboard accessible.
              tabIndex={0}
            >
              {report.events.length === 0 ? (
                <p className={styles.empty}>{labels.empty}</p>
              ) : (
                <ol>
                  {report.events.map((event) => (
                    <li
                      key={`${event.frameIndex}:${event.type}:${event.ids.join(',')}`}
                      data-frame={event.frameIndex + 1}
                      data-event-type={event.type}
                    >
                      <strong>
                        {labels.frame} {event.frameIndex + 1} ·{' '}
                        {labels.eventTypes[event.type] ?? event.type}
                      </strong>
                      <code>{event.text}</code>
                      <small>
                        {roles[event.before] ?? event.before} → {roles[event.after] ?? event.after}
                      </small>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </div>
      </StreamingFrame>
    </div>
  );
};

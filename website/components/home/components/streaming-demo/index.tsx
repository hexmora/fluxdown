import { compute } from '@fluxdown/utils';
import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useId } from 'react';

import type { BottomScrollMode } from '../../../bottom-scroll';

import { useBottomScroll } from '../../../bottom-scroll';
import { DEMO_BUILD, DEMO_PLUGINS, getDemoTheme, getStreamSample } from '../../../demo';
import { useLocale, useStream } from '../../../hooks';
import { PauseIcon, PlayIcon, ReplayIcon, SidebarIcon } from '../../../icons';
import { COPY } from './consts';
import { useReducedMotion, useSourcePanel } from './hooks';
import styles from './index.module.scss';

export const StreamingDemo = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];
  const dark = useDark();
  const reducedMotion = useReducedMotion();
  const stream = useStream(getStreamSample(lang), reducedMotion);
  const { expanded, toggleExpanded } = useSourcePanel();
  let scrollMode: BottomScrollMode = 'static';
  if (!reducedMotion) {
    scrollMode = stream.playing ? 'active' : 'idle';
  }
  const preview = useBottomScroll(reducedMotion, scrollMode);
  const source = useBottomScroll(reducedMotion, scrollMode);
  const sourceId = useId();

  return (
    <section aria-label={labels.label} className={styles.demo}>
      <div className={styles.paper} data-expanded={expanded}>
        <button
          aria-controls={sourceId}
          aria-expanded={expanded}
          aria-label={expanded ? labels.close : labels.toggle}
          className={`${styles.control} ${styles.sidebarToggle}`}
          onClick={toggleExpanded}
          title={expanded ? labels.close : labels.toggle}
          type="button"
        >
          <SidebarIcon />
        </button>
        <div className={styles.actions}>
          {!stream.complete && (
            <button
              aria-label={stream.playing ? labels.pause : labels.resume}
              className={styles.control}
              onClick={stream.toggle}
              title={stream.playing ? labels.pause : labels.resume}
              type="button"
            >
              {stream.playing ? <PauseIcon /> : <PlayIcon />}
            </button>
          )}
          <button
            aria-label={labels.replay}
            className={styles.control}
            onClick={stream.replay}
            title={labels.replay}
            type="button"
          >
            <ReplayIcon />
          </button>
        </div>
        <div aria-hidden={!expanded} className={styles.source} id={sourceId}>
          {/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Make the scrollable pane keyboard accessible. */}
          <section
            aria-label={labels.source}
            className={styles.scroll}
            ref={source.viewportRef}
            tabIndex={expanded ? 0 : -1}
          >
            <div className={styles.sourceContent} ref={source.contentRef}>
              <span className={styles.sourceTitle}>{labels.source}</span>
              <pre>
                {stream.text}
                <span className={styles.cursor} data-active={stream.playing} />
              </pre>
            </div>
          </section>
          {/* oxlint-enable jsx-a11y/no-noninteractive-tabindex */}
        </div>
        <div className={styles.preview}>
          {/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Make the scrollable pane keyboard accessible. */}
          <section
            aria-label={labels.preview}
            className={styles.scroll}
            ref={preview.viewportRef}
            tabIndex={0}
          >
            <div className={styles.previewContent} ref={preview.contentRef}>
              <Fluxdown
                build={DEMO_BUILD}
                plugins={DEMO_PLUGINS}
                streaming={compute(() => {
                  if (stream.complete) {
                    return false;
                  }

                  return {
                    smooth: true,
                    repairEnding: true,
                    effect: reducedMotion ? false : 'scale',
                  };
                })}
                text={stream.text}
                theme={getDemoTheme(dark)}
              />
            </div>
          </section>
          {/* oxlint-enable jsx-a11y/no-noninteractive-tabindex */}
        </div>
        <div className={styles.progress} aria-hidden="true">
          <span style={{ transform: `scaleX(${stream.progress})` }} />
        </div>
      </div>
    </section>
  );
};

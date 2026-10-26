import type { StreamingFrameProps } from './type';

import { useLocale } from '../../../hooks';
import { PauseIcon, PlayIcon, ReplayIcon } from '../../../icons';
import { COPY } from './consts';
import styles from './index.module.scss';

export const StreamingFrame = ({ label, caption, controls, children }: StreamingFrameProps) => {
  const { lang } = useLocale();

  const labels = COPY[lang];

  return (
    <section aria-label={label} className={styles.demo}>
      <div className={styles.toolbar}>
        {caption ? <div className={styles.caption}>{caption}</div> : null}
        <div className={styles.controls}>
          {!controls.complete && (
            <button
              aria-label={controls.playing ? labels.pause : labels.resume}
              onClick={controls.toggle}
              title={controls.playing ? labels.pause : labels.resume}
              type="button"
            >
              {controls.playing ? <PauseIcon /> : <PlayIcon />}
            </button>
          )}
          <button
            aria-label={labels.replay}
            onClick={controls.replay}
            title={labels.replay}
            type="button"
          >
            <ReplayIcon />
          </button>
        </div>
      </div>
      {children}
    </section>
  );
};

import type { StreamingControlsProps } from './type';

import { useLocale } from '../../../hooks';
import { PauseIcon, PlayIcon, ReplayIcon } from '../../../icons';
import { COPY } from './consts';
import styles from './index.module.scss';

export const StreamingControls = ({ controls }: StreamingControlsProps) => {
  const { lang } = useLocale();

  const labels = COPY[lang];

  return (
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
  );
};

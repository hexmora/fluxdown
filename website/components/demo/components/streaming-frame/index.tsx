import type { StreamingFrameProps } from './type';

import { StreamingControls } from '../streaming-controls';
import styles from './index.module.scss';

export const StreamingFrame = ({ label, caption, controls, children }: StreamingFrameProps) => {
  return (
    <section aria-label={label} className={styles.demo}>
      {controls && (
        <div className={styles.toolbar}>
          {caption ? <div className={styles.caption}>{caption}</div> : null}
          <StreamingControls controls={controls} />
        </div>
      )}
      {children}
    </section>
  );
};

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The scrollable preview supports keyboard navigation. */

import type { StreamingPreviewProps } from './type';

import { useBottomScroll } from '../../../bottom-scroll';
import styles from './index.module.scss';

export const StreamingPreview = ({ label, reducedMotion, children }: StreamingPreviewProps) => {
  const { viewportRef, contentRef } = useBottomScroll(reducedMotion);

  return (
    <section
      aria-label={label}
      className={styles.viewport}
      data-streaming-viewport="true"
      ref={viewportRef}
      tabIndex={0}
    >
      <div className={styles.content} ref={contentRef}>
        {children}
      </div>
    </section>
  );
};

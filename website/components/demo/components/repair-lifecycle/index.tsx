import { useLocale } from '../../../hooks';
import { COPY } from './consts';
import styles from './index.module.scss';

export const RepairLifecycle = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];

  return (
    <figure className={styles.diagram} aria-label={labels.label} data-demo="repair-lifecycle">
      <div className={styles.flow}>
        <div className={styles.stage}>
          <strong>1 · {labels.prepare}</strong>
          <code>prepare</code>
          <small>{labels.prepareOrder}</small>
        </div>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
        <div className={`${styles.stage} ${styles.run}`}>
          <strong>2 · {labels.run}</strong>
          <small>{labels.runOrder}</small>
          <div className={styles.hooks}>
            <code>before</code>
            <span className={styles.runner}>
              <code>beforeEach</code>
              <span aria-hidden="true">→</span>
              <code>runner</code>
              <span aria-hidden="true">→</span>
              <code>afterEach</code>
            </span>
            <code>after</code>
          </div>
        </div>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
        <div className={styles.stage}>
          <strong>3 · {labels.cleanup}</strong>
          <span>{labels.cleanupAction}</span>
          <small>{labels.cleanupOrder}</small>
        </div>
      </div>
    </figure>
  );
};

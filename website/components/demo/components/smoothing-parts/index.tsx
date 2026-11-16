import { useLocale } from '../../../hooks';
import { COPY } from './consts';
import styles from './index.module.scss';

export const SmoothingPartsDiagram = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];

  return (
    <figure aria-label={labels.label} className={styles.diagram} data-demo="smoothing-parts">
      <div className={styles.inputs}>
        <div className={styles.input}>
          <strong>{labels.driver}</strong>
          <span className={styles.caption}>{labels.when}</span>
          <div className={styles.ticks}>
            {[80, 160, 240].map((time) => (
              <span key={time} data-current={time === 160}>
                <span aria-hidden="true" />
                {time}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.input}>
          <strong>{labels.target}</strong>
          <span className={styles.caption}>{labels.goal}</span>
          <div className={styles.target}>
            8 <small>{labels.units}</small>
          </div>
        </div>
      </div>
      <svg
        className={styles.branches}
        viewBox="0 0 100 24"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M25 0V10H50V23M75 0V10H50M48 19L50 23L52 19" />
      </svg>
      <div className={styles.interpolation}>
        <div>
          <strong>{labels.interpolation}</strong>
          <span className={styles.caption}>{labels.distance}</span>
        </div>
        <strong className={styles.step}>+2</strong>
      </div>
      <div className={styles.arrow} aria-hidden="true">
        ↓
      </div>
      <div className={styles.output}>
        <div className={styles.outputLabel}>
          <span>{labels.visible}</span>
          <strong>
            3 → 5 <small>/ 8</small>
          </strong>
        </div>
        <div className={styles.progress} aria-hidden="true">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((position) => (
            <span
              key={position}
              data-visible={position <= 5}
              data-new={position > 3 && position <= 5}
            />
          ))}
        </div>
      </div>
    </figure>
  );
};

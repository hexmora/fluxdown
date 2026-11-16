import { useLocale } from '../../../hooks';
import { COPY } from './consts';
import styles from './index.module.scss';

export const RepairFlow = () => {
  const { lang } = useLocale();
  const labels = COPY[lang];

  return (
    <figure className={styles.diagram} aria-label={labels.label} data-demo="repair-flow">
      <div className={styles.flow}>
        <span className={styles.omitted} aria-hidden="true">
          ⋯
        </span>
        <div className={styles.tree}>
          <strong>AST</strong>
          <span>{labels.input}</span>
        </div>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
        <div className={styles.repair}>
          <strong>{labels.repair}</strong>
          <ol className={styles.steps}>
            {labels.steps.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className={styles.conversion}>
          <small>{labels.convert}</small>
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </div>
        <div className={styles.tree}>
          <strong>HAST</strong>
          <span>{labels.output}</span>
        </div>
        <span className={styles.omitted} aria-hidden="true">
          ⋯
        </span>
      </div>
    </figure>
  );
};

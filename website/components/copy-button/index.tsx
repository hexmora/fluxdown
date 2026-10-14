import type { CopyButtonProps } from './type';

import { useLocale } from '../hooks';
import { CheckIcon, CopyIcon } from '../icons';
import { COPY_LABELS } from './consts';
import { useClipboard } from './hooks';
import styles from './index.module.scss';

export const CopyButton = ({ value, label }: CopyButtonProps) => {
  const { lang } = useLocale();
  const { status, copy } = useClipboard(value);
  const feedback = COPY_LABELS[lang];
  const copyLabel = label ?? feedback.label;

  return (
    <span className={styles.root}>
      <button
        aria-label={copyLabel}
        className={styles.button}
        onClick={copy}
        title={copyLabel}
        type="button"
      >
        {status === 'copied' ? <CheckIcon /> : <CopyIcon />}
      </button>
      <output className={styles.feedback}>{status === 'idle' ? '' : feedback[status]}</output>
    </span>
  );
};

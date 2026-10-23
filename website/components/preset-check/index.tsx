import { useLocale } from '../hooks';
import { CheckIcon } from '../icons';
import styles from './index.module.scss';

export const PresetCheck = () => {
  const { lang } = useLocale();

  return (
    <CheckIcon
      aria-hidden={false}
      aria-label={lang === 'zh' ? '内置' : 'Built in'}
      className={styles.check}
    />
  );
};

import { useDark } from '@rspress/core/runtime';
import { Fluxdown } from 'fluxdown';
import { useState } from 'react';

import { useLocale } from '../../../hooks';
import { ResetIcon } from '../../../icons';
import { getDemoTheme } from '../../utils';
import { COPY } from './consts';
import styles from './index.module.scss';

export const DiagramDemo = ({ language }: { language: 'mermaid' | 'mindmap' }) => {
  const { lang } = useLocale();

  const labels = COPY[lang];

  const dark = useDark();

  const [text, setText] = useState(labels.samples[language]);

  return (
    <div className={styles.demo} data-demo={language}>
      <div className={styles.toolbar}>
        <span>{labels.edit}</span>
        <button
          aria-label={labels.reset}
          onClick={() => setText(labels.samples[language])}
          title={labels.reset}
          type="button"
        >
          <ResetIcon />
        </button>
      </div>
      <textarea
        aria-label={labels.source}
        autoCapitalize="off"
        autoComplete="off"
        className={styles.source}
        onChange={(event) => setText(event.currentTarget.value)}
        spellCheck={false}
        value={text}
      />
      <div aria-label={labels.preview} className={styles.preview}>
        <Fluxdown text={text} theme={getDemoTheme(dark)} />
      </div>
    </div>
  );
};

import type { KeyboardEvent, ReactNode } from 'react';

import { Children, useId } from 'react';

import type { CodeFramework } from './hooks';

import { useLocale } from '../hooks';
import { DEFAULT_FRAMEWORKS } from './consts';
import { useCodeFramework } from './hooks';
import styles from './index.module.scss';

export { useCodeFramework } from './hooks';
export type { CodeFramework } from './hooks';

interface FrameworkCodeTabsProps {
  children: ReactNode;
  frameworks?: readonly CodeFramework[];
}

export const FrameworkCodeTabs = ({
  children,
  frameworks = DEFAULT_FRAMEWORKS,
}: FrameworkCodeTabsProps) => {
  const id = useId();

  const { lang } = useLocale();

  const [preferredFramework, setFramework] = useCodeFramework();

  const active = Math.max(
    0,
    frameworks.findIndex((value) => value === preferredFramework),
  );

  const panels = Children.toArray(children).filter(
    (child) => typeof child !== 'string' || child.trim().length > 0,
  );

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % frameworks.length
        : event.key === 'ArrowLeft'
          ? (index + frameworks.length - 1) % frameworks.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? frameworks.length - 1
              : undefined;

    if (next === undefined) return;

    event.preventDefault();

    setFramework(frameworks[next]);

    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <div className={styles.root} data-framework-code>
      <div
        aria-label={lang === 'zh' ? '代码框架' : 'Code framework'}
        className={styles.tabs}
        role="tablist"
      >
        {frameworks.map((framework, index) => (
          <button
            aria-controls={`${id}-panel-${index}`}
            aria-selected={active === index}
            className={styles.tab}
            id={`${id}-tab-${index}`}
            key={framework}
            onClick={() => setFramework(framework)}
            onKeyDown={(event) => onKeyDown(event, index)}
            role="tab"
            tabIndex={active === index ? 0 : -1}
            type="button"
          >
            {framework}
          </button>
        ))}
      </div>
      {panels.map((panel, index) => (
        <div
          aria-labelledby={`${id}-tab-${index}`}
          className={styles.panel}
          hidden={active !== index}
          id={`${id}-panel-${index}`}
          key={frameworks[index]}
          role="tabpanel"
          tabIndex={0}
        >
          {panel}
        </div>
      ))}
    </div>
  );
};

import type { KeyboardEvent, ReactNode } from 'react';

import { Children, useId, useState } from 'react';

import { useLocale } from '../hooks';
import styles from './index.module.scss';

export type CodeFramework = 'Core' | 'React' | 'Vue' | 'React Native' | 'Lynx' | 'Solid' | 'Taro';

interface FrameworkCodeTabsProps {
  children: ReactNode;
  frameworks?: CodeFramework[];
}

const DEFAULT_FRAMEWORKS: CodeFramework[] = [
  'React',
  'Vue',
  'React Native',
  'Lynx',
  'Solid',
  'Taro',
];

export const FrameworkCodeTabs = ({
  children,
  frameworks = DEFAULT_FRAMEWORKS,
}: FrameworkCodeTabsProps) => {
  const id = useId();

  const { lang } = useLocale();

  const [active, setActive] = useState(0);

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

    setActive(next);

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
            onClick={() => setActive(index)}
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

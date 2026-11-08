/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Markdown previews contain block content and nested controls. */

import type { ReactNode } from 'react';

import { useLocale } from '../../../hooks';
import styles from './index.module.scss';

const INTERACTIVE =
  'a, button, input, textarea, select, label, summary, [role="button"], [role="link"], [contenteditable="true"]';

export const StreamAccelerator = ({
  onAdvance,
  onReplay,
  complete,
  children,
  className,
  label,
}: {
  onAdvance(): void;
  onReplay(): void;
  complete: boolean;
  children: ReactNode;
  className?: string;
  label?: string;
}) => {
  const { lang } = useLocale();
  const advanceHint = lang === 'zh' ? '点击加速' : 'Click to speed up';
  const replayHint = lang === 'zh' ? '重新播放' : 'Replay';
  const hint = complete ? replayHint : advanceHint;
  const activate = complete ? onReplay : onAdvance;

  return (
    <div
      aria-label={label ? `${label} · ${hint}` : hint}
      className={`${styles.accelerator} ${className ?? ''}`}
      data-stream-accelerator="true"
      onClick={(event) => {
        if (window.getSelection()?.isCollapsed === false) return;
        const control = (event.target as Element).closest(INTERACTIVE);
        if (control && control !== event.currentTarget) return;
        activate();
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || event.repeat) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {children}
      <span aria-hidden="true" className={styles.hint}>
        {hint}
      </span>
    </div>
  );
};

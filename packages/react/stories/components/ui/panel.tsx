import type { ReactNode } from 'react';

import { useId } from 'react';

/**
 * Properties panel: a scrolling column of titled groups beside the workspace.
 */
export const Panel = ({ label, children }: { label: string; children: ReactNode }) => (
  <aside aria-label={label} className="ui-panel">
    {children}
  </aside>
);

interface PanelGroupProps {
  title: string;

  /**
   * Compact controls shown at the end of the group heading, such as a reset button.
   */
  actions?: ReactNode;

  children: ReactNode;
}

/**
 * One titled group of property rows. Rows share a label column, so labels, controls, and
 * values align down the whole panel.
 */
export const PanelGroup = ({ title, actions, children }: PanelGroupProps) => {
  const id = useId();

  return (
    <section aria-labelledby={id} className="ui-group">
      <div className="ui-group-heading">
        <h3 id={id}>{title}</h3>
        {actions}
      </div>
      <div className="ui-group-body">{children}</div>
    </section>
  );
};

/**
 * A grid of equal-width buttons spanning a group.
 */
export const PanelActions = ({ children }: { children: ReactNode }) => (
  <div className="ui-group-actions">{children}</div>
);

/**
 * Read-only label and value rows, aligned with the control rows of a group.
 */
export const Readouts = ({ label, rows }: { label: string; rows: [string, ReactNode][] }) => (
  <dl aria-label={label} className="ui-readouts">
    {rows.map(([name, value]) => (
      <div key={name}>
        <dt>{name}</dt>
        <dd title={typeof value === 'string' ? value : undefined}>{value}</dd>
      </div>
    ))}
  </dl>
);

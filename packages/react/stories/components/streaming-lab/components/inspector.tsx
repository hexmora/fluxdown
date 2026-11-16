import { useSyncExternalStore } from 'react';

import type { StreamingLab } from '../hooks';

import { PanelGroup, Readouts } from '../../ui';
import { StreamingLabChart } from './chart';

/**
 * Live readout of the spring interpolator that drives the preview.
 */
export const StreamingLabInspector = ({ lab }: { lab: StreamingLab }) => {
  const snapshot = useSyncExternalStore(lab.inspector.subscribe, lab.inspector.getSnapshot);

  const state = !lab.settings.smooth
    ? 'Smooth off'
    : !snapshot.attached
      ? 'Waiting'
      : snapshot.idle
        ? 'Idle'
        : 'Moving';

  const rows: [string, string][] = [
    ['State', state],
    ['Target', String(snapshot.target)],
    ['Visible', String(snapshot.cursor)],
    ['Backlog', String(snapshot.target - snapshot.cursor)],
    ['Position', snapshot.position.toFixed(2)],
    ['Velocity', `${snapshot.velocity.toFixed(1)}/s`],
    ['Ticks', String(snapshot.ticks)],
    ['Frame Δ', `${snapshot.frameInterval.toFixed(1)} ms`],
    ['Last event', snapshot.lastEvent],
  ];

  return (
    <PanelGroup title="Inspector">
      <StreamingLabChart lab={lab} />

      <Readouts label="Spring inspector" rows={rows} />
    </PanelGroup>
  );
};

import { toPhysicalSpring } from '@fluxdown/core-presets/mapper';
import { useSyncExternalStore } from 'react';

import type { StreamingLab } from './hooks';
import type { AnimationSpeed, LabEffect, LabTicker } from './type';

import { Button, Segmented, Select, Slider, Switch } from '../ui';
import { ANIMATION_SPEEDS } from './consts';

export * from './hooks';
export type * from './type';

const getSpringType = (dampingRatio: number) => {
  if (Math.abs(dampingRatio - 1) < 1e-6) {
    return 'Critical';
  }

  return dampingRatio < 1 ? 'Underdamped' : 'Overdamped';
};

const TICKER_OPTIONS: { value: LabTicker; label: string }[] = [
  { value: 'raf', label: 'Animation frame' },
  { value: 'interval', label: 'Interval 16 ms' },
];

const EFFECT_OPTIONS: { value: LabEffect; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'shad', label: 'Trailing fade' },
  { value: 'scale', label: 'Scale' },
];

const SPEED_OPTIONS = ANIMATION_SPEEDS.map((speed) => ({ value: speed, label: `${speed}×` }));

/**
 * Smoothing, spring, playback-rate, and effect controls for a streaming lab.
 */
export const StreamingLabControls = ({ lab }: { lab: StreamingLab }) => {
  const { settings, update, reset } = lab;

  const { stiffness, damping, mass } = toPhysicalSpring(settings);

  const critical = 2 * Math.sqrt(stiffness * mass);

  return (
    <>
      <fieldset className="playground-transport">
        <legend>Smoothing</legend>

        <Switch
          checked={settings.smooth}
          label="Smooth"
          onChange={(smooth) => update({ smooth })}
        />

        <Select<LabTicker>
          label="Ticker"
          onChange={(ticker) => update({ ticker })}
          options={TICKER_OPTIONS}
          value={settings.ticker}
        />

        <Segmented<AnimationSpeed>
          label="Animation speed"
          onChange={(speed) => update({ speed })}
          options={SPEED_OPTIONS}
          value={settings.speed}
        />

        <Slider
          format={(value) => `${value.toFixed(1)} rad/s`}
          label="ω frequency"
          max={30}
          min={0.5}
          onChange={(frequency) => update({ frequency })}
          step={0.5}
          value={settings.frequency}
        />

        <Slider
          format={(value) => value.toFixed(2)}
          label="ζ damping"
          max={2}
          min={0.05}
          onChange={(dampingRatio) => update({ dampingRatio })}
          step={0.05}
          value={settings.dampingRatio}
        />

        <span className="playground-meta">
          {getSpringType(settings.dampingRatio)} · k {stiffness.toFixed(1)} · c {damping.toFixed(1)}{' '}
          · c critical {critical.toFixed(1)}
        </span>

        <div className="playground-actions">
          <Button onClick={reset}>Reset streaming</Button>
        </div>
      </fieldset>

      <fieldset className="playground-transport">
        <legend>Effect</legend>

        <Select<LabEffect>
          label="Effect"
          onChange={(effect) => update({ effect })}
          options={EFFECT_OPTIONS}
          value={settings.effect}
        />

        {settings.effect === 'shad' ? (
          <>
            <Slider
              format={(value) => `${value} chars`}
              label="Fade length"
              max={30}
              min={0}
              onChange={(shadLength) => update({ shadLength })}
              step={1}
              value={settings.shadLength}
            />

            <Slider
              format={(value) => `${value} px`}
              label="Mask width"
              max={60}
              min={0}
              onChange={(maskWidth) => update({ maskWidth })}
              step={1}
              value={settings.maskWidth}
            />

            <Slider
              format={(value) => `${value} ms`}
              label="Hide delay"
              max={1000}
              min={0}
              onChange={(hideDelay) => update({ hideDelay })}
              step={10}
              value={settings.hideDelay}
            />
          </>
        ) : null}

        {settings.effect === 'scale' ? (
          <>
            <Slider
              format={(value) => `${value} ms`}
              label="Duration"
              max={1000}
              min={0}
              onChange={(scaleDuration) => update({ scaleDuration })}
              step={10}
              value={settings.scaleDuration}
            />

            <Slider
              format={(value) => value.toFixed(2)}
              label="From scale"
              max={1}
              min={0}
              onChange={(scaleFrom) => update({ scaleFrom })}
              step={0.05}
              value={settings.scaleFrom}
            />

            <Slider
              format={(value) => `${value.toFixed(2)} em`}
              label="Blur"
              max={0.3}
              min={0}
              onChange={(scaleBlur) => update({ scaleBlur })}
              step={0.01}
              value={settings.scaleBlur}
            />
          </>
        ) : null}
      </fieldset>
    </>
  );
};

/**
 * Live readout of the spring scheduler that drives the preview.
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

  return (
    <dl aria-label="Spring inspector" className="playground-inspector">
      <div>
        <dt>State</dt>
        <dd>{state}</dd>
      </div>
      <div>
        <dt>Target</dt>
        <dd>{snapshot.target}</dd>
      </div>
      <div>
        <dt>Visible</dt>
        <dd>{snapshot.cursor}</dd>
      </div>
      <div>
        <dt>Backlog</dt>
        <dd>{snapshot.target - snapshot.cursor}</dd>
      </div>
      <div>
        <dt>Position</dt>
        <dd>{snapshot.position.toFixed(2)}</dd>
      </div>
      <div>
        <dt>Velocity</dt>
        <dd>{snapshot.velocity.toFixed(1)}/s</dd>
      </div>
      <div>
        <dt>Ticks</dt>
        <dd>{snapshot.ticks}</dd>
      </div>
      <div>
        <dt>Frame Δ</dt>
        <dd>{snapshot.frameInterval.toFixed(1)} ms</dd>
      </div>
      <div className="playground-inspector-wide">
        <dt>Last event</dt>
        <dd title={snapshot.lastEvent}>{snapshot.lastEvent}</dd>
      </div>
    </dl>
  );
};

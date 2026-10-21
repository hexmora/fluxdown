import { toPhysicalSpring } from '@fluxdown/core-presets/mapper';

import type { StreamingLab } from '../hooks';
import type { AnimationSpeed, LabDriver, LabEffect } from '../type';

import { Button, PanelGroup, Readouts, Segmented, Select, Slider, Switch } from '../../ui';
import { ANIMATION_SPEEDS } from '../consts';

const getSpringType = (dampingRatio: number) => {
  if (Math.abs(dampingRatio - 1) < 1e-6) {
    return 'Critical';
  }

  return dampingRatio < 1 ? 'Underdamped' : 'Overdamped';
};

const DRIVER_OPTIONS: { value: LabDriver; label: string }[] = [
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
 * Clock, spring, and effect groups for a streaming lab's properties panel.
 */
export const StreamingLabControls = ({ lab }: { lab: StreamingLab }) => {
  const { settings, update, reset } = lab;

  const { stiffness, damping, mass } = toPhysicalSpring(settings);

  const critical = 2 * Math.sqrt(stiffness * mass);

  return (
    <>
      <PanelGroup
        actions={
          <Button onClick={reset} title="Restore every streaming setting">
            Reset
          </Button>
        }
        title="Clock"
      >
        <Switch
          checked={settings.smooth}
          label="Smooth"
          onChange={(smooth) => update({ smooth })}
        />

        <Select<LabDriver>
          label="Driver"
          onChange={(driver) => update({ driver })}
          options={DRIVER_OPTIONS}
          value={settings.driver}
        />

        <Segmented<AnimationSpeed>
          label="Speed"
          onChange={(speed) => update({ speed })}
          options={SPEED_OPTIONS}
          value={settings.speed}
        />
      </PanelGroup>

      <PanelGroup title="Spring">
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

        <Readouts
          label="Physical spring"
          rows={[
            ['Type', getSpringType(settings.dampingRatio)],
            ['Stiffness', `k ${stiffness.toFixed(1)}`],
            ['Damping', `c ${damping.toFixed(1)} · crit ${critical.toFixed(1)}`],
          ]}
        />
      </PanelGroup>

      <PanelGroup title="Effect">
        <Select<LabEffect>
          label="Effect"
          onChange={(effect) => update({ effect })}
          options={EFFECT_OPTIONS}
          value={settings.effect}
        />

        {settings.effect === 'shad' ? (
          <>
            <Slider
              format={(value) => `${value} ch`}
              label="In flight"
              max={30}
              min={0}
              onChange={(shadLength) => update({ shadLength })}
              step={1}
              value={settings.shadLength}
            />

            <Slider
              format={(value) => `${value} ms`}
              label="Max fade"
              max={1500}
              min={0}
              onChange={(shadDuration) => update({ shadDuration })}
              step={10}
              value={settings.shadDuration}
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
      </PanelGroup>
    </>
  );
};

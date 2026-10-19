import type { ComponentProps, ReactNode } from 'react';

import { Button as BaseButton } from '@base-ui/react/button';
import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import cn from 'classnames';

import './style.scss';

interface ButtonProps extends ComponentProps<typeof BaseButton> {
  primary?: boolean;
}

export const Button = ({ className, primary = false, ...props }: ButtonProps) => (
  <BaseButton
    className={cn('ui-button', primary && 'ui-button-primary', className as string)}
    {...props}
  />
);

interface SliderProps {
  label: string;

  value: number;

  min: number;

  max: number;

  step: number;

  format: (value: number) => string;

  onChange: (value: number) => void;
}

export const Slider = ({ label, value, min, max, step, format, onChange }: SliderProps) => (
  <BaseSlider.Root
    className="ui-slider"
    max={max}
    min={min}
    onValueChange={onChange}
    step={step}
    value={value}
  >
    <BaseSlider.Label className="ui-label">{label}</BaseSlider.Label>
    <BaseSlider.Control className="ui-slider-control">
      <BaseSlider.Track className="ui-slider-track">
        <BaseSlider.Indicator className="ui-slider-indicator" />
        <BaseSlider.Thumb aria-label={label} className="ui-slider-thumb" />
      </BaseSlider.Track>
    </BaseSlider.Control>
    <output className="ui-value">{format(value)}</output>
  </BaseSlider.Root>
);

interface SelectProps<T extends string | number> {
  label: string;

  value: T;

  options: { value: T; label: string }[];

  onChange: (value: T) => void;
}

const ChevronIcon = () => (
  <svg aria-hidden fill="none" height="10" viewBox="0 0 10 10" width="10">
    <path d="M2.5 4 5 6.5 7.5 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
  </svg>
);

const CheckIcon = () => (
  <svg aria-hidden fill="none" height="12" viewBox="0 0 12 12" width="12">
    <path
      d="m2.75 6.25 2.25 2.25 4.25-4.75"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

export const Select = <T extends string | number>({
  label,
  value,
  options,
  onChange,
}: SelectProps<T>) => (
  <div className="ui-field">
    <BaseSelect.Root
      items={options}
      onValueChange={(next) => {
        if (next !== null) {
          onChange(next);
        }
      }}
      value={value}
    >
      <BaseSelect.Label className="ui-label">{label}</BaseSelect.Label>
      <BaseSelect.Trigger className="ui-select-trigger">
        <BaseSelect.Value />
        <BaseSelect.Icon className="ui-select-icon">
          <ChevronIcon />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="ui-select-positioner" sideOffset={4}>
          <BaseSelect.Popup className="ui-select-popup">
            {options.map((option) => (
              <BaseSelect.Item className="ui-select-item" key={option.value} value={option.value}>
                <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                <BaseSelect.ItemIndicator className="ui-select-check">
                  <CheckIcon />
                </BaseSelect.ItemIndicator>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  </div>
);

interface SwitchProps {
  label: string;

  checked: boolean;

  onChange: (checked: boolean) => void;
}

export const Switch = ({ label, checked, onChange }: SwitchProps) => (
  // Clicking the label toggles the switch through native label association.
  <label className="ui-field ui-switch-field">
    <BaseSwitch.Root checked={checked} className="ui-switch" onCheckedChange={onChange}>
      <BaseSwitch.Thumb className="ui-switch-thumb" />
    </BaseSwitch.Root>
    {label}
  </label>
);

interface SegmentedProps<T extends string | number> {
  label: string;

  value: T;

  options: { value: T; label: ReactNode }[];

  onChange: (value: T) => void;
}

export const Segmented = <T extends string | number>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>) => (
  <div className="ui-field">
    <span className="ui-label">{label}</span>
    <ToggleGroup
      aria-label={label}
      className="ui-segmented"
      onValueChange={(next) => {
        // Toggle values are strings; map back to the typed option. Pressing the active item
        // empties the group, which is ignored so exactly one value stays pressed.
        const option = options.find((item) => String(item.value) === next[0]);

        if (option) {
          onChange(option.value);
        }
      }}
      value={[String(value)]}
    >
      {options.map((option) => (
        <Toggle className="ui-segment" key={option.value} value={String(option.value)}>
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  </div>
);

interface NumberFieldProps {
  label: string;

  value: number;

  min?: number;

  max?: number;

  step?: number;

  unit?: string;

  onChange: (value: number) => void;
}

export const NumberField = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: NumberFieldProps) => (
  <BaseNumberField.Root
    className="ui-field ui-number"
    max={max}
    min={min}
    onValueChange={(next) => {
      if (next !== null) {
        onChange(next);
      }
    }}
    step={step}
    value={value}
  >
    {/* Dragging the label scrubs the value, like a design tool's numeric input. */}
    <BaseNumberField.ScrubArea className="ui-number-scrub">
      <span className="ui-label">{label}</span>
    </BaseNumberField.ScrubArea>
    <BaseNumberField.Group className="ui-number-group">
      <BaseNumberField.Input aria-label={label} className="ui-number-input" />
      {unit ? <span className="ui-number-unit">{unit}</span> : null}
    </BaseNumberField.Group>
  </BaseNumberField.Root>
);

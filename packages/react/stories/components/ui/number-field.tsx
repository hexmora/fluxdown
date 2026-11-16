import { NumberField as BaseNumberField } from '@base-ui/react/number-field';

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

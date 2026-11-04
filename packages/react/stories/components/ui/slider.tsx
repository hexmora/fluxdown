import { Slider as BaseSlider } from '@base-ui/react/slider';

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

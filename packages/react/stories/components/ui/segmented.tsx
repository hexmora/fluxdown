import type { ReactNode } from 'react';

import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';

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

import { Select as BaseSelect } from '@base-ui/react/select';

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

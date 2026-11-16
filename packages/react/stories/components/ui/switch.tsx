import { Switch as BaseSwitch } from '@base-ui/react/switch';

interface SwitchProps {
  label: string;

  checked: boolean;

  onChange: (checked: boolean) => void;
}

export const Switch = ({ label, checked, onChange }: SwitchProps) => (
  // Clicking the label toggles the switch through native label association.
  <label className="ui-field ui-switch-field">
    <span className="ui-label">{label}</span>
    <BaseSwitch.Root checked={checked} className="ui-switch" onCheckedChange={onChange}>
      <BaseSwitch.Thumb className="ui-switch-thumb" />
    </BaseSwitch.Root>
  </label>
);

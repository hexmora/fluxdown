import type { ComponentProps } from 'react';

import { Button as BaseButton } from '@base-ui/react/button';
import cn from 'classnames';

interface ButtonProps extends ComponentProps<typeof BaseButton> {
  primary?: boolean;
}

export const Button = ({ className, primary = false, ...props }: ButtonProps) => (
  <BaseButton
    className={cn('ui-button', primary && 'ui-button-primary', className as string)}
    {...props}
  />
);

import type { CodeHeaderProps } from '@fluxdown/react-plugins/base';

import { CopyButton } from '../../../copy-button';

export const CodeHeader = ({ Raw, code, ...props }: CodeHeaderProps) => {
  const actions = [{ key: 'copy', target: <CopyButton value={code} /> }];

  return Raw ? <Raw {...props} actions={() => actions} code={code} /> : null;
};

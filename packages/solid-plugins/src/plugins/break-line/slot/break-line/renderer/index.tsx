import { splitProps } from 'solid-js';

import type { BreakLineProps } from '../../../../../base';

export const BreakLineRenderer = (props: BreakLineProps) => {
  const [, elementProps] = splitProps(props, ['Raw']);

  return <br {...elementProps} />;
};

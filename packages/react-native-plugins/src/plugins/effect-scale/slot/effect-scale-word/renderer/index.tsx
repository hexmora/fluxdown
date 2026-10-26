import { Children, Fragment } from 'react';

import type { ScaleWordProps } from '../../../../../base';

import { InheritedText } from '../../../../../base';

export const ScaleWordRenderer = ({ children }: ScaleWordProps) => {
  return (
    <InheritedText numberOfLines={1}>
      {Children.map(children, (child, index) => (
        <Fragment>
          {index > 0 && '\u2060'}
          {child}
        </Fragment>
      ))}
    </InheritedText>
  );
};

import { render } from '@testing-library/react';

import { SuffixRenderer } from '../renderer';

test.each(['cursor', 'dot'] as const)('keeps the %s suffix outside the text layout', (type) => {
  const view = render(<SuffixRenderer type={type} />);

  const marker = view.container.querySelector(`[data-fluxdown-suffix="${type}"]`);

  expect(marker).toHaveClass('root');

  expect(marker?.firstElementChild).toHaveClass(type);
});

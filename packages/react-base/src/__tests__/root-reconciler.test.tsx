import type { ReactNode } from 'react';

import { act, render, screen } from '@testing-library/react';
import { MutableState } from 'stative';

import { RootReconciler } from '../components/root-reconciler';

test('reorders reactive keyed children without a wrapper or taking ownership of the source', () => {
  const first = <p key="first">first</p>;

  const second = <p key="second">second</p>;

  const children = MutableState.of<ReactNode[]>([first, second]);

  const view = render(<RootReconciler>{children}</RootReconciler>);

  const firstNode = screen.getByText('first');

  const secondNode = screen.getByText('second');

  act(() => {
    children.next([second, first]);
  });

  expect([...view.container.children]).toEqual([secondNode, firstNode]);

  view.unmount();

  expect(children.closed).toBe(false);

  children.destroy();
});

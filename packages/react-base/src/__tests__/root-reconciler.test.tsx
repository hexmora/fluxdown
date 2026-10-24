/// <reference lib="dom" />

import { act, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MutableState } from 'stative';

import { RootReconciler } from '../components/root-reconciler';

describe('RootReconciler', () => {
  test('renders children without a host wrapper and preserves keyed nodes while reordering', () => {
    const first = (
      <p data-testid="root-item-first" key="first">
        first
      </p>
    );

    const second = (
      <p data-testid="root-item-second" key="second">
        second
      </p>
    );

    const children = MutableState.of<ReactNode[]>([first, second]);

    const view = render(<RootReconciler>{children}</RootReconciler>);

    const root = view.container;

    const firstElement = screen.getByTestId('root-item-first');

    const secondElement = screen.getByTestId('root-item-second');

    expect([...root!.children]).toEqual([firstElement, secondElement]);

    act(() => {
      children.next([second, first]);
    });

    expect([...root!.children]).toEqual([secondElement, firstElement]);

    view.unmount();

    expect(children.closed).toBe(false);
  });
});

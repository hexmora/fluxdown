import { isArray } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';

import type { StateSubscription } from '../../../__internal__';
import type { IReactiveState, StateInputValue } from '../../type';

import { toState } from '..';
import { isStateSourceLike } from '../../../__internal__';

export type Input = {
  source: unknown;
  state: IReactiveState<unknown> | null;
  completed: boolean;
  active: boolean;
  subscription?: StateSubscription;
};

export const toSources = (source: unknown): readonly unknown[] =>
  isArray(source) ? source : [source];

export const createInput = (source: unknown): Input => {
  const state = isStateSourceLike(source) ? toState(source) : null;

  return { source, state, completed: state === null, active: false };
};

export const readInputValues = <S>(inputs: Input[], multiple: boolean): StateInputValue<S> => {
  if (!multiple) {
    const [input] = inputs;

    return (input.state ? input.state.value : input.source) as StateInputValue<S>;
  }

  return inputs.map((input) =>
    input.state ? input.state.value : input.source,
  ) as StateInputValue<S>;
};

export const isInputValuesEqual = (value: unknown, previous: unknown, multiple: boolean): boolean =>
  multiple
    ? isArray(value) && isArray(previous) && shallowEqual(value, previous)
    : Object.is(value, previous);

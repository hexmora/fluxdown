import { isObject } from 'lodash-es';

import type { IReactiveState } from '../../type';

import { getStateRevision } from '../../../__internal__';

export const getInputRevision = (source: IReactiveState<unknown>, value: unknown) => {
  return isObject(value) ? getStateRevision(source) : 0;
};

export const isValuesEqual = (previous: readonly unknown[], current: readonly unknown[]) => {
  return (
    previous.length === current.length &&
    current.every((value, index) => Object.is(previous[index], value))
  );
};

export const hasRevisions = (revisions: (number | undefined)[]): revisions is number[] => {
  return revisions.every((revision) => typeof revision === 'number');
};

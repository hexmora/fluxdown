import { isFunction } from 'lodash-es';
import { Subject } from 'rxjs';

import type { DestructibleTarget } from '../../type';

import { isDestructible } from './utils';

export const clearByTarget = (target: DestructibleTarget) => {
  if (target instanceof Subject) {
    target.complete();

    return;
  }

  if (isDestructible(target)) {
    target.destroy();

    return;
  }

  if (isFunction(target)) {
    target();

    return;
  }

  target.unsubscribe();
};

import { last } from 'lodash-es';

import { FakeSmoothDriver } from '../modules/driver/__tests__/utils';
import {
  DoubleStepSmoothInterpolator,
  StepSmoothInterpolator,
} from '../modules/interpolation/__tests__/utils';

export class PrimarySmoothDriver extends FakeSmoothDriver {
  static instances: PrimarySmoothDriver[] = [];

  constructor() {
    super();

    PrimarySmoothDriver.instances.push(this);
  }
}

export class SecondarySmoothDriver extends FakeSmoothDriver {
  static instances: SecondarySmoothDriver[] = [];

  constructor() {
    super();

    SecondarySmoothDriver.instances.push(this);
  }
}

export const resetSmoothTests = () => {
  PrimarySmoothDriver.instances = [];

  SecondarySmoothDriver.instances = [];

  StepSmoothInterpolator.instances = [];

  DoubleStepSmoothInterpolator.instances = [];
};

export const latest = <T>(instances: T[]): T => {
  const instance = last(instances);

  if (!instance) {
    throw new Error('Expected a constructed test instance.');
  }

  return instance;
};

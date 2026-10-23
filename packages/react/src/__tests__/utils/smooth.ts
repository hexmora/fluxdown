import {
  BaseSmoothDriver,
  BaseSmoothInterpolator,
} from '@fluxdown/core-presets/plugins/mapper/smooth';
import { last } from 'lodash-es';

export const createManualDriver = () => {
  class ManualDriver extends BaseSmoothDriver {
    private active = false;

    destroyCalls = 0;

    constructor() {
      super();

      instances.push(this);
    }

    get running() {
      return this.active;
    }

    start() {
      this.active = true;

      return 0;
    }

    stop() {
      this.active = false;
    }

    tick(timestamp: number) {
      this.subject.next(timestamp);
    }

    override destroy() {
      if (this.destroyed) {
        return;
      }

      this.destroyCalls += 1;

      this.stop();

      super.destroy();
    }
  }

  const instances: ManualDriver[] = [];

  const current = () => {
    const driver = last(instances);

    if (!driver) {
      throw new Error('Expected the configured driver to be constructed.');
    }

    return driver;
  };

  return { Driver: ManualDriver, current, instances };
};

export const createStepInterpolator = (step: number) => {
  return class StepInterpolator extends BaseSmoothInterpolator {
    protected readonly defaultTuple = [];

    private cursor = 0;

    override get idle() {
      return true;
    }

    override reset(index = 0) {
      super.reset(index);

      this.cursor = index;
    }

    start(_timestamp: number, index = 0) {
      this.reset(index);
    }

    tick(_timestamp: number) {
      const distance = Math.min(step, Math.max(0, this.fullIndex - this.cursor));

      this.cursor += distance;

      return distance;
    }
  };
};

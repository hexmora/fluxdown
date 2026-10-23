import {
  type PerceptualSpring,
  type SmoothInterpolatorClass,
  SpringSmoothInterpolator,
} from '@fluxdown/core-presets/plugins/mapper/smooth';

export interface TunableSpring {
  /**
   * Interpolator class whose instances read the current spring.
   */
  Interpolator: SmoothInterpolatorClass;

  /**
   * Change the spring without a jump: the running trajectory is pinned first, so new parameters
   * only shape the motion from this moment on.
   */
  retune: (spring: PerceptualSpring) => void;
}

export const createTunableSpring = (initial: PerceptualSpring): TunableSpring => {
  let spring = initial;

  let current: TunedSpringInterpolator | null = null;

  const attach = (interpolation: TunedSpringInterpolator) => {
    current = interpolation;
  };

  class TunedSpringInterpolator extends SpringSmoothInterpolator {
    constructor(tuple?: number[]) {
      super(tuple);

      attach(this);
    }

    override get tuple() {
      return [spring.frequency, spring.dampingRatio];
    }

    pin() {
      // An empty push rebases the trajectory at the latest timestamp under the current spring.
      this.push(0);
    }
  }

  return {
    Interpolator: TunedSpringInterpolator,
    retune: (next) => {
      current?.pin();

      spring = next;
    },
  };
};

export const getDampingKind = (dampingRatio: number) => {
  if (Math.abs(dampingRatio - 1) < 1e-6) {
    return 'critical';
  }

  return dampingRatio < 1 ? 'underdamped' : 'overdamped';
};

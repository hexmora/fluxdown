import { getSpringMotion, type PerceptualSpring, toPerceptualSpring, toPhysicalSpring } from '..';

const SPRINGS: PerceptualSpring[] = [0.2, 1, 1.3].map((dampingRatio) => ({
  frequency: 15,
  dampingRatio,
}));

describe('spring representations', () => {
  test('converts perceptual parameters to physical coefficients for a unit mass', () => {
    expect(toPhysicalSpring({ frequency: 15, dampingRatio: 1.3 })).toEqual({
      stiffness: 225,
      damping: 39,
      mass: 1,
    });
  });

  test('converts physical coefficients to perceptual parameters', () => {
    const critical = toPerceptualSpring({ stiffness: 225, damping: 30, mass: 1 });

    expect(critical.frequency).toBe(15);

    expect(critical.dampingRatio).toBe(1);
  });

  test.each([0.5, 1, 2.5])('round-trips through a mass of %d', (mass) => {
    const physical = toPhysicalSpring({ frequency: 12, dampingRatio: 0.7 }, mass);

    expect(physical.mass).toBe(mass);

    const perceptual = toPerceptualSpring(physical);

    expect(perceptual.frequency).toBeCloseTo(12, 12);

    expect(perceptual.dampingRatio).toBeCloseTo(0.7, 12);
  });
});

describe('getSpringMotion', () => {
  test.each(SPRINGS)(
    'keeps the initial motion at zero elapsed time with ζ=$dampingRatio',
    (spring) => {
      expect(getSpringMotion(spring, { displacement: -7, velocity: 3 }, 0)).toEqual({
        displacement: -7,
        velocity: 3,
      });
    },
  );

  test.each(SPRINGS)('satisfies the oscillator equation with ζ=$dampingRatio', (spring) => {
    const { frequency, dampingRatio } = spring;

    const initial = { displacement: -10, velocity: 4 };

    const step = 1e-5;

    for (const seconds of [0.01, 0.05, 0.2]) {
      const before = getSpringMotion(spring, initial, seconds - step);

      const current = getSpringMotion(spring, initial, seconds);

      const after = getSpringMotion(spring, initial, seconds + step);

      const velocity = (after.displacement - before.displacement) / (2 * step);

      const acceleration = (after.velocity - before.velocity) / (2 * step);

      expect(current.velocity).toBeCloseTo(velocity, 4);

      expect(
        acceleration +
          2 * dampingRatio * frequency * current.velocity +
          frequency ** 2 * current.displacement,
      ).toBeCloseTo(0, 2);
    }
  });

  test.each(SPRINGS)('composes elapsed intervals exactly with ζ=$dampingRatio', (spring) => {
    const initial = { displacement: -40, velocity: 25 };

    const direct = getSpringMotion(spring, initial, 0.48);

    let stepped = initial;

    for (let index = 0; index < 30; index += 1) {
      stepped = getSpringMotion(spring, stepped, 0.016);
    }

    expect(stepped.displacement).toBeCloseTo(direct.displacement, 10);

    expect(stepped.velocity).toBeCloseTo(direct.velocity, 10);
  });

  test('is continuous across critical damping', () => {
    const initial = { displacement: -10, velocity: 2 };

    const critical = getSpringMotion({ frequency: 15, dampingRatio: 1 }, initial, 0.1);

    for (const dampingRatio of [1 - 1e-5, 1 + 1e-5]) {
      const nearby = getSpringMotion({ frequency: 15, dampingRatio }, initial, 0.1);

      expect(nearby.displacement).toBeCloseTo(critical.displacement, 3);

      expect(nearby.velocity).toBeCloseTo(critical.velocity, 3);
    }
  });

  test('approaches rest from one side without overshoot when overdamped from rest', () => {
    const spring = { frequency: 15, dampingRatio: 1.3 };

    let previous = -100;

    for (let seconds = 0.01; seconds < 2; seconds += 0.01) {
      const { displacement } = getSpringMotion(
        spring,
        { displacement: -100, velocity: 0 },
        seconds,
      );

      expect(displacement).toBeLessThan(0);

      expect(displacement).toBeGreaterThan(previous);

      previous = displacement;
    }
  });
});

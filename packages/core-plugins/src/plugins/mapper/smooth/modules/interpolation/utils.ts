import type { PerceptualSpring, PhysicalSpring, SpringMotion } from './type';

/**
 * Damping ratios this close to 1 use the critical solution, whose overdamped and underdamped
 * counterparts divide by a vanishing root difference.
 */
const CRITICAL_TOLERANCE = 1e-6;

/**
 * Convert a perceptual spring to physical coefficients for the supplied mass.
 * @default mass 1
 */
export const toPhysicalSpring = (
  { frequency, dampingRatio }: PerceptualSpring,
  mass = 1,
): PhysicalSpring => ({
  stiffness: mass * frequency ** 2,
  damping: 2 * dampingRatio * mass * frequency,
  mass,
});

/**
 * Convert physical coefficients to a perceptual spring.
 */
export const toPerceptualSpring = ({
  stiffness,
  damping,
  mass,
}: PhysicalSpring): PerceptualSpring => ({
  frequency: Math.sqrt(stiffness / mass),
  dampingRatio: damping / (2 * Math.sqrt(stiffness * mass)),
});

/**
 * Solve the damped harmonic oscillator x'' + 2ζωx' + ω²x = 0 in closed form.
 * Returns the motion `seconds` after the supplied one, so the result depends only on elapsed time and
 * not on how that time was split into steps.
 */
export const getSpringMotion = (
  { frequency, dampingRatio }: PerceptualSpring,
  { displacement, velocity }: SpringMotion,
  seconds: number,
): SpringMotion => {
  if (Math.abs(dampingRatio - 1) < CRITICAL_TOLERANCE) {
    const decay = Math.exp(-frequency * seconds);

    const slope = velocity + frequency * displacement;

    return {
      displacement: (displacement + slope * seconds) * decay,
      velocity: (velocity - frequency * slope * seconds) * decay,
    };
  }

  if (dampingRatio < 1) {
    const decayRate = dampingRatio * frequency;

    const damped = frequency * Math.sqrt(1 - dampingRatio ** 2);

    const decay = Math.exp(-decayRate * seconds);

    const cos = Math.cos(damped * seconds);

    const sin = Math.sin(damped * seconds);

    const amplitude = (velocity + decayRate * displacement) / damped;

    return {
      displacement: decay * (displacement * cos + amplitude * sin),
      velocity: decay * (velocity * cos - (damped * displacement + decayRate * amplitude) * sin),
    };
  }

  const spread = frequency * Math.sqrt(dampingRatio ** 2 - 1);

  const slow = -dampingRatio * frequency + spread;

  const fast = -dampingRatio * frequency - spread;

  const slowWeight = (velocity - fast * displacement) / (slow - fast);

  const fastWeight = displacement - slowWeight;

  const slowTerm = slowWeight * Math.exp(slow * seconds);

  const fastTerm = fastWeight * Math.exp(fast * seconds);

  return {
    displacement: slowTerm + fastTerm,
    velocity: slow * slowTerm + fast * fastTerm,
  };
};

import { StateBatch } from '../__internal__';

/** Publish one consistent update when the outermost synchronous batch finishes. */
export const batch = <T>(runner: () => T): T => {
  return StateBatch.run(runner);
};

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

declare module 'vitest' {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > extends TestingLibraryMatchers<T, R> {}
}

expect.extend(matchers);

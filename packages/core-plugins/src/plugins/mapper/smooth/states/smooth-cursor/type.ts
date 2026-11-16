import type { BlockRevisionsInputs, SmoothInterpolatorInputs } from './states';

export interface SmoothCursorInputs<T> extends BlockRevisionsInputs<T>, SmoothInterpolatorInputs {}

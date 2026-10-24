import type { BlockRevisionsInputs, SmoothSchedulerInputs } from './states';

export interface SmoothCursorInputs<T> extends BlockRevisionsInputs<T>, SmoothSchedulerInputs {}

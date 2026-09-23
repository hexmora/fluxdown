import type { BlockRevisionsInputs, CursorPositionInputs } from './states';

export interface SmoothCursorInputs<T>
  extends BlockRevisionsInputs<T>, Omit<CursorPositionInputs, 'revisions' | 'ticks'> {}

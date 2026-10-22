import { once, useMapKeyed } from 'stative';

import type { BlockRevisionsInputs } from './type';

import { createBlockRevision } from './utils';

export * from './type';

export const BlockRevisions = /*#__PURE__*/ once(function BlockRevisions<T>({
  source,
}: BlockRevisionsInputs<T>) {
  return useMapKeyed(source, createBlockRevision);
});

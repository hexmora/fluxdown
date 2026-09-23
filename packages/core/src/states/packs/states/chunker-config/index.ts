import { isEqual, pick } from 'lodash-es';
import { memoReturns } from 'stative';

import type { TextChunkerConfig } from '../../../base';
import type { ChunkerConfigInputs } from './type';

export * from './type';

export const ChunkerConfig = /*#__PURE__*/ memoReturns(function ChunkerConfig({
  config,
}: ChunkerConfigInputs): TextChunkerConfig {
  return pick(config, ['indentedCode', 'setextHeading', 'tex']);
}, isEqual);

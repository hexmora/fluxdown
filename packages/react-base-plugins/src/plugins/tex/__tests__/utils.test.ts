import type { Element } from 'hast';

import { getTex } from '../render/tex/utils';

const math = (value: string, repairing: boolean): Element => ({
  type: 'element',
  tagName: 'span',
  properties: { dataType: 'inline-math' },
  children: [{ type: 'text', value, data: { repairEnding: repairing } }],
});

test.each(['\\alpha ', 'x+\\sinh\n', '\\sum\t'])(
  'preserves the final control-word boundary only while repairing: %s',
  (value) => {
    expect(getTex({ node: math('  ' + value, true), parents: [] })).toBe(value);
    expect(getTex({ node: math('  ' + value, false), parents: [] })).toBe(value.trim());
  },
);

test('keeps an empty repaired formula matched without changing static empty formulas', () => {
  expect(getTex({ node: math('', true), parents: [] })).toBe('');
  expect(getTex({ node: math('', false), parents: [] })).toBeNull();
});

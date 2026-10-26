import type { Element } from 'hast';

import { buildPluggables } from '@fluxdown/core';
import { describe, expect, test } from '@rstest/core';
import { sortBy } from 'lodash-es';

import type { AnySlotPluggable } from '../base';

import { toPluginList } from '../base/plugins';
import { PRESET_FULL_PLUGINS } from '../presets/full';
import { PRESET_LITE_PLUGINS } from '../presets/lite';

const expectedSlots = [
  'Blockquote',
  'BreakLine',
  'CodeBlock',
  'CodeHeader',
  'CodeHighlighter',
  'Emphasis',
  'Heading',
  'Image',
  'Link',
  'List',
  'Paragraph',
  'Strong',
  'Table',
  'TableCell',
  'Element',
  'Chunk',
  'Scale',
  'ScaleWord',
  'Shad',
  'Suffix',
  'Tex',
];

const getKeys = (slots: AnySlotPluggable[]) =>
  slots.map((slot) => (Array.isArray(slot) ? slot[0] : slot).key);

describe.each([
  ['lite', PRESET_LITE_PLUGINS],
  ['full', PRESET_FULL_PLUGINS],
] as const)('%s preset', (_name, plugins) => {
  test('supplies every Markdown and stream slot without installing policy overrides', () => {
    const slots = toPluginList(plugins, 'slots').map((plugin) => buildPluggables(plugin));

    expect(sortBy([...new Set(slots.map((plugin) => plugin.type))])).toEqual(sortBy(expectedSlots));

    slots.forEach((plugin) => plugin.destroy());
  });

  test('keeps fallback last and lets semantic renders match before it', () => {
    const renders = toPluginList(plugins, 'renders').map((plugin) => buildPluggables(plugin));

    const fallback = renders.at(-1);

    expect(fallback?.config.priority).toBe(Infinity);

    expect(
      renders.filter((plugin) =>
        plugin.match({ node: { type: 'text', value: 'plain' }, parents: [] }),
      ),
    ).toEqual([fallback]);

    const node: Element = {
      type: 'element',
      tagName: 'span',
      properties: { dataType: 'inline-math' },
      children: [{ type: 'text', value: 'x' }],
    };

    expect(renders.filter((plugin) => plugin.match({ node, parents: [] }))).toHaveLength(2);

    renders.forEach((plugin) => plugin.destroy());
  });
});

test('full adds working code tokenization and text normalization to the lite foundation', () => {
  const fullSlots = toPluginList(PRESET_FULL_PLUGINS, 'slots');

  const liteSlots = toPluginList(PRESET_LITE_PLUGINS, 'slots');

  expect(getKeys(fullSlots)).toContain('slot-code-shiki');

  expect(getKeys(liteSlots)).not.toContain('slot-code-shiki');

  expect(toPluginList(PRESET_FULL_PLUGINS, 'remarks')).toHaveLength(2);

  expect(toPluginList(PRESET_LITE_PLUGINS, 'remarks')).toHaveLength(0);
});

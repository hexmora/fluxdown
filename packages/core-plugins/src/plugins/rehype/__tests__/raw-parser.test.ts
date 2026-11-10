import type { Element, Nodes, Root } from 'hast';

import { unified } from 'unified';

import { MarkdownCompiler } from '../../../../../core/src/states/hast/block-compiler/exports';
import { PRESET_REHYPE_PLUGINS } from '../../../presets/rehype';
import { PRESET_REPAIR_PLUGINS } from '../../../presets/repair';
import { ApplyRepairsRemarkPlugin } from '../../remark/apply-repairs';
import { SyntaxMathRemarkPlugin } from '../../remark/syntax-math';
import { RawParserRehypePlugin } from '../raw-parser';
import { unwrapRepairText, wrapRepairText } from '../raw-parser/utils';

const findElement = (root: Nodes, tagName: string): Element | undefined => {
  if (root.type === 'element' && root.tagName === tagName) {
    return root;
  }

  if (!('children' in root)) {
    return undefined;
  }

  for (const child of root.children) {
    const match = findElement(child, tagName);

    if (match) {
      return match;
    }
  }

  return undefined;
};

const containsRawNode = (root: Nodes | { type: 'raw' }): boolean => {
  if (root.type === 'raw') {
    return true;
  }

  return 'children' in root && root.children.some(containsRawNode);
};

describe('RawParserRehypePlugin', () => {
  test('parses embedded HTML into standard HAST before sanitization', () => {
    const root = MarkdownCompiler.build({
      text: 'before <mark data-token="kept">inside</mark> after',
      rehypes: [new RawParserRehypePlugin()],
    });
    const mark = findElement(root, 'mark');

    expect(containsRawNode(root)).toBe(false);
    expect(mark?.properties).toMatchObject({ dataToken: 'kept' });
    expect(mark?.children).toEqual([
      expect.objectContaining({
        type: 'text',
        value: 'inside',
      }),
    ]);

    const paragraph = findElement(root, 'p');

    expect(paragraph?.children.map((node) => node.type)).toEqual(['text', 'element', 'text']);
  });

  test('passes parser configuration to rehype-raw', () => {
    const config = { tagfilter: true };
    const plugin = new RawParserRehypePlugin(config);

    config.tagfilter = false;

    const root = MarkdownCompiler.build({
      text: '<script>alert(1)</script>',
      rehypes: [plugin],
    });

    expect(findElement(root, 'script')).toBeUndefined();
    expect(containsRawNode(root)).toBe(false);
  });
});

test('preserves ending-repair text metadata through raw parsing and the complete rehype preset', () => {
  const source = '$x+\\frac{a}{';
  const tree = MarkdownCompiler.build({
    text: source,
    remarks: [
      new SyntaxMathRemarkPlugin(),
      new ApplyRepairsRemarkPlugin({
        plugins: PRESET_REPAIR_PLUGINS.map((Plugin) => new Plugin()),
        ending: true,
      }),
    ],
    rehypes: PRESET_REHYPE_PLUGINS.map((Plugin) => new Plugin()),
  });

  expect(findElement(tree, 'span')?.children).toEqual([
    expect.objectContaining({ type: 'text', value: 'x+\\frac{a}{', data: { repairEnding: true } }),
  ]);
  expect(JSON.stringify(tree)).not.toContain('repaired_text');
  expect(findElement(tree, 'span')?.properties).not.toHaveProperty('repairEnding');
});

test('retains text boundaries and metadata inside parsed raw HTML without exposing a DOM marker', () => {
  const original: Root = {
    type: 'root',
    children: [
      { type: 'raw', value: '<span>' },
      { type: 'text', value: 'before ' },
      {
        type: 'text',
        value: '<literal>&entity;',
        data: { repairEnding: true, renderKey: 'stable' },
      },
      { type: 'text', value: ' after' },
      { type: 'raw', value: '</span>' },
    ],
  };
  const snapshot = structuredClone(original);
  const processor = unified();

  for (const Plugin of PRESET_REHYPE_PLUGINS) {
    processor.use(new Plugin().plugin);
  }

  const tree = processor.runSync(original) as Root;

  expect(findElement(tree, 'span')?.children).toEqual([
    expect.objectContaining({ type: 'text', value: 'before ' }),
    snapshot.children[2],
    expect.objectContaining({ type: 'text', value: ' after' }),
  ]);
  expect(original).toEqual(snapshot);
  expect(unwrapRepairText(wrapRepairText(original))).toEqual(snapshot);
  expect(findElement(tree, 'span')?.properties).toEqual({});
  expect(JSON.stringify(tree)).not.toContain('repaired_text');
});

test('combines the internal text wrapper with configured custom pass-through nodes', () => {
  const config = { passThrough: ['customLeaf'] };
  const parser = new RawParserRehypePlugin(config);
  const custom = { type: 'customLeaf', value: 'custom' };
  const repaired = { type: 'text', value: 'pending', data: { repairEnding: true } };
  const tree = { type: 'root', children: [custom, repaired] } as Root;

  config.passThrough.length = 0;

  const result = unified().use(parser.plugin).runSync(tree);

  expect(result).toMatchObject({ children: [custom, repaired] });
  expect(JSON.stringify(result)).not.toContain('repaired_text');
});

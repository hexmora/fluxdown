import { CodeRenderPlugin } from '@fluxdown/react-base-plugins/plugins/code';

import { filterDisabledBy, pluginExtends } from '../base';
import { CodeHeaderSlotPlugin, CodePlugin } from '../plugins/code';
import { CodePrismPlugin, CodePrismSlotPlugin } from '../plugins/code-prism';
import { CodeShikiPlugin, CodeShikiSlotPlugin } from '../plugins/code-shiki';
import { TexPlugin, TexSlotPlugin } from '../plugins/tex';
import { TexKatexPlugin, TexKatexSlotPlugin } from '../plugins/tex-katex';
import { TexMathjaxKatexPlugin, TexMathjaxKatexSlotPlugin } from '../plugins/tex-mathjax-katex';

describe('plugin pack extension', () => {
  test('applies configuration to its own pack while preserving declaration order', () => {
    const first = {
      renders: [CodeRenderPlugin],
      slots: [CodeHeaderSlotPlugin],
      config: { 'slot-code-header': { priority: 1 } },
    };
    const second = {
      slots: [CodeHeaderSlotPlugin],
      config: { 'slot-code-header': { priority: 2 } },
    };

    const extended = pluginExtends(first, second, { slots: [TexSlotPlugin] });

    expect(extended.renders).toEqual([CodeRenderPlugin]);
    expect(extended.slots).toEqual([
      [CodeHeaderSlotPlugin, { priority: 1 }],
      [CodeHeaderSlotPlugin, { priority: 2 }],
      TexSlotPlugin,
    ]);
    expect(first.slots).toEqual([CodeHeaderSlotPlugin]);
    expect(second.slots).toEqual([CodeHeaderSlotPlugin]);
    expect(extended.config).toBeUndefined();
  });

  test('allows a later pack to disable an inherited plugin and enable it again', () => {
    const disabled = pluginExtends(CodePlugin, {
      slots: [CodeHeaderSlotPlugin],
      config: { 'slot-code-header': { disabled: true } },
    });

    expect(disabled.slots).not.toContain(CodeHeaderSlotPlugin);
    expect(disabled.slots).toContainEqual([CodeHeaderSlotPlugin, { disabled: true }]);

    const enabled = pluginExtends(disabled, { slots: [CodeHeaderSlotPlugin] });

    expect(enabled.slots?.at(-1)).toBe(CodeHeaderSlotPlugin);
  });

  test('filters disabled plugins by constructor identity rather than shared config keys', () => {
    class CustomCodeHeaderSlotPlugin extends CodeHeaderSlotPlugin {}

    expect(
      filterDisabledBy(
        [CodeHeaderSlotPlugin, CustomCodeHeaderSlotPlugin],
        [[CodeHeaderSlotPlugin, { disabled: true }]],
      ),
    ).toEqual([CustomCodeHeaderSlotPlugin]);
  });

  test.each([
    [CodePlugin, CodePrismPlugin, CodePrismSlotPlugin],
    [CodePlugin, CodeShikiPlugin, CodeShikiSlotPlugin],
    [TexPlugin, TexKatexPlugin, TexKatexSlotPlugin],
    [TexPlugin, TexMathjaxKatexPlugin, TexMathjaxKatexSlotPlugin],
  ])('keeps complete base renderers and slots in a derived pack', (base, derived, Slot) => {
    expect(derived.renders).toEqual(base.renders);
    expect(derived.slots).toEqual([...(base.slots ?? []), Slot]);
  });
});

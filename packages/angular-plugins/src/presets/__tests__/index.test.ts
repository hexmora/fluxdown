import { pluginExtends, toPluginList } from '@fluxdown/angular-plugins/base';
import { PRESET_FULL_PLUGINS } from '@fluxdown/angular-plugins/full';
import { PRESET_LITE_PLUGINS } from '@fluxdown/angular-plugins/lite';
import { CodePlugin } from '@fluxdown/angular-plugins/plugins/code';
import { CodePelePlugin } from '@fluxdown/angular-plugins/plugins/code-pele';
import { CodeShikiPlugin } from '@fluxdown/angular-plugins/plugins/code-shiki';

const keys = (items: typeof PRESET_FULL_PLUGINS) => {
  return toPluginList(items, 'slots').map((slot) => (Array.isArray(slot) ? slot[0].key : slot.key));
};

describe('presets', () => {
  test('full adds syntax highlighting, diagrams and math while lite stays basic', () => {
    expect(PRESET_LITE_PLUGINS).toContain(CodePlugin);

    expect(PRESET_LITE_PLUGINS).not.toContain(CodeShikiPlugin);

    expect(PRESET_LITE_PLUGINS).not.toContain(CodePelePlugin);

    expect(PRESET_FULL_PLUGINS).toContain(CodeShikiPlugin);

    expect(PRESET_FULL_PLUGINS).toContain(CodePelePlugin);

    expect(keys(PRESET_FULL_PLUGINS)).toContain('slot-tex');
  });

  test('preserves base rendering when slot alternatives extend a plugin', () => {
    const extended = pluginExtends(CodePlugin, CodeShikiPlugin, CodePelePlugin);

    expect(extended.renders).toContain(CodePlugin.renders?.[0]);

    expect(keys([extended])).toEqual(
      expect.arrayContaining(['slot-code-block', 'slot-code-header', 'slot-code-highlighter']),
    );
  });

  test('applies scoped disabled config to inherited plugins', () => {
    const disabled = pluginExtends(CodePlugin, {
      ...CodePlugin,
      config: { 'render-code': { disabled: true }, 'slot-code-block': { disabled: true } },
    });

    expect(disabled.renders).toHaveLength(1);

    expect(disabled.renders?.[0]).toEqual([CodePlugin.renders?.[0], { disabled: true }]);
  });
});

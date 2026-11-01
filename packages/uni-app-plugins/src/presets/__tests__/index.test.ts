import { pluginExtends, toPluginList } from '../../base/plugins';
import { CodePlugin } from '../../plugins/code';
import { CodePrismPlugin } from '../../plugins/code-prism';
import { PRESET_FULL_PLUGINS } from '../full';
import { PRESET_LITE_PLUGINS } from '../lite';

describe('uni-app presets', () => {
  test('full adds native text syntax highlighting while lite uses plain code', () => {
    expect(PRESET_LITE_PLUGINS).toContain(CodePlugin);

    expect(PRESET_LITE_PLUGINS).not.toContain(CodePrismPlugin);

    expect(PRESET_FULL_PLUGINS).toContain(CodePrismPlugin);

    expect(toPluginList(PRESET_FULL_PLUGINS, 'slots')).toContain(CodePrismPlugin.slots?.at(-1));
  });

  test('preserves code rendering when replacing the highlighter', () => {
    const extended = pluginExtends(CodePlugin, CodePrismPlugin);

    expect(extended.renders).toContain(CodePlugin.renders?.[0]);
  });

  test('preserves scoped overrides when disabling a renderer', () => {
    const disabled = pluginExtends(CodePlugin, {
      ...CodePlugin,
      config: { 'render-code': { disabled: true } },
    });

    expect(disabled.renders).toEqual([[CodePlugin.renders?.[0], { disabled: true }]]);
  });
});

import type { IBlockState } from '@fluxdown/types';
import type { Element, ElementContent, Parent, RootContent } from 'hast';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

import { BaseRehypePlugin } from '@fluxdown/core-plugins/plugins/rehype/base';
import { HoistFootnoteRehypePlugin } from '@fluxdown/core-plugins/plugins/rehype/hoist-footnote';
import { ApplyRepairsRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/apply-repairs';
import { BaseRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/base';
import { PatchesRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/patches';
import { SyntaxMathRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/syntax-math';
import { BaseRepairPlugin } from '@fluxdown/core-plugins/plugins/repair/base';
import { DanglingFootnoteRepairPlugin } from '@fluxdown/core-plugins/plugins/repair/dangling-footnote';
import { PRESET_REHYPE_PLUGINS } from '@fluxdown/core-plugins/presets/rehype';
import { PRESET_REMARK_PLUGINS } from '@fluxdown/core-plugins/presets/remark';
import { PRESET_REPAIR_PLUGINS } from '@fluxdown/core-plugins/presets/repair';
import {
  type IBasePluginConfig,
  type IPluggable,
  type IPluggableConfig,
  type IRehypePlugin,
  type IRemarkPlugin,
  type IRepairPlugin,
  PluginPriority,
  type PluginSet,
  type RemarkPluginConfigContext,
  type RemarkPluginEnabledContext,
  type RepairPluginConfigContext,
  type RepairPluginEnabledContext,
  type RepairPluginRunner,
  type RepairPluginSystemConfig,
} from '@fluxdown/types';
import { expectTypeOf } from 'expect-type';
import { first, last, nth } from 'lodash-es';
import {
  D,
  type IReactiveState,
  type IReadableClosure,
  MutableState,
  ReactiveState,
  render,
  S,
} from 'stative';

import type { HastRoot } from '../../../typings';
import type { BlockCompilerConfig } from '../../hast';

import { Core, type IPatchItem } from '..';
import { countStateObservers } from '../../../../../../scripts/testing/state';
import {
  BaseRenderer,
  BaseRenderPlugin,
  type IRenderPatchItem,
  type IRenderPluggable,
  type IRenderPlugin,
} from '../../../externals';

interface AppendRemarkPluginConfig {
  suffix?: string;
}

class AppendRemarkPlugin extends BaseRemarkPlugin {
  static readonly key = 'remark-test-append';

  static readonly destroyed = jest.fn();

  readonly config: IBasePluginConfig = { priority: PluginPriority.Default };

  private readonly innerConfig: AppendRemarkPluginConfig;

  constructor(config: AppendRemarkPluginConfig = {}) {
    super();

    this.innerConfig = { ...config };
  }

  plugin: Plugin<[], Root, Root> = () => {
    return (tree) => {
      const tail = last(tree.children);

      if (tail?.type === 'paragraph') {
        tail.children.push({ type: 'text', value: this.innerConfig.suffix ?? '' });
      }
    };
  };

  override destroy() {
    if (!this.destroyed) {
      AppendRemarkPlugin.destroyed(this.innerConfig.suffix);
    }

    super.destroy();
  }
}

class AppendRehypePlugin extends BaseRehypePlugin {
  static readonly key = 'rehype-test-append';

  static readonly destroyed = jest.fn();

  config = { priority: PluginPriority.Lowest };

  plugin: Plugin<[], HastRoot, HastRoot> = () => {
    return (tree) => {
      tree.children.push({ type: 'text', value: '|rehype' });
    };
  };

  override destroy() {
    if (!this.destroyed) {
      AppendRehypePlugin.destroyed();
    }

    super.destroy();
  }
}

interface EndingMarkerRepairPluginConfig {
  marker?: string;
}

class EndingMarkerRepairPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-test-ending-marker';

  static readonly destroyed = jest.fn();

  readonly config: RepairPluginSystemConfig = {
    ending: true,
    priority: PluginPriority.Lowest,
  };

  private readonly innerConfig: EndingMarkerRepairPluginConfig;

  constructor(config: EndingMarkerRepairPluginConfig = {}) {
    super();

    this.innerConfig = { ...config };
  }

  runner: RepairPluginRunner = ({ node }) => {
    if (node.type !== 'root') {
      return;
    }

    const tail = last(node.children);

    if (tail?.type === 'paragraph') {
      tail.children.push({ type: 'text', value: this.innerConfig.marker ?? '|ending' });
    }
  };

  override destroy() {
    if (!this.destroyed) {
      EndingMarkerRepairPlugin.destroyed(this.innerConfig.marker);
    }

    super.destroy();
  }
}

const DEFAULT_CONFIG: BlockCompilerConfig = {
  repair: false,
  repairEnding: false,
  footnote: false,
  tex: false,
  indentedCode: false,
  setextHeading: false,
};

interface RenderedBlock extends IBlockState<HastRoot> {
  renderPatches: IReactiveState<IRenderPatchItem<RenderedBlock>[]>;

  renderPlugins: IRenderPlugin<ElementContent, Parent, RenderedBlock>[];
}

class TestRenderPlugin extends BaseRenderPlugin<ElementContent, Parent, RenderedBlock> {
  static readonly key = 'render-test';

  static readonly constructed = jest.fn();

  static readonly destroyed = jest.fn();

  constructor() {
    super();

    TestRenderPlugin.constructed();
  }

  match() {
    return true;
  }

  render(): RenderedBlock {
    throw new Error('Test render plugins are not invoked by the test renderer.');
  }

  override destroy() {
    if (!this.destroyed) {
      TestRenderPlugin.destroyed();
    }

    super.destroy();
  }
}

const renderTestItem = (
  item: IBlockState<HastRoot>,
  patches: IReactiveState<IRenderPatchItem<RenderedBlock>[]>,
  plugins: IReactiveState<IRenderPlugin<ElementContent, Parent, RenderedBlock>[]>,
): RenderedBlock => {
  return {
    baseLength: item.baseLength,
    destroy: () => {
      return item.destroy();
    },
    fork: (params) => {
      return item.fork(params);
    },
    length: item.length,
    meta: item.meta,
    range: item.range,
    renderPatches: patches,
    renderPlugins: plugins.value,
    value: item.value,
  };
};

class TestRenderer extends BaseRenderer<HastRoot, ElementContent, Parent, RenderedBlock> {
  protected renderItem(item: IBlockState<HastRoot>): RenderedBlock {
    const { patches, plugins } = this.inputs;

    return renderTestItem(item, patches.value, plugins.value);
  }
}

const collectText = (node: HastRoot | RootContent): string => {
  if (node.type === 'text') {
    return node.value;
  }

  if ('children' in node) {
    return node.children
      .map((child) => {
        return collectText(child);
      })
      .join('');
  }

  return '';
};

const findElement = (
  node: HastRoot | RootContent,
  predicate: (element: Element) => boolean,
): Element | undefined => {
  if (node.type === 'element' && predicate(node)) {
    return node;
  }

  if (!('children' in node)) {
    return undefined;
  }

  for (const child of node.children) {
    const result = findElement(child, predicate);

    if (result) {
      return result;
    }
  }

  return undefined;
};

const getBlockTree = (block: RenderedBlock | undefined): HastRoot => {
  if (!block) {
    throw new Error('Expected a compiled block.');
  }

  return block.value.value;
};

const getFirstBlockTree = (state: {
  readonly value: IReactiveState<RenderedBlock[]>;
}): HastRoot => {
  return getBlockTree(first(state.value.value));
};

const setupCore = (initialText = 'base') => {
  const text = MutableState.of(initialText);
  const patches = MutableState.of<IPatchItem<RenderedBlock>[]>([]);

  const build = MutableState.of(DEFAULT_CONFIG);
  const remarks = MutableState.of<PluginSet<IPluggable<IRemarkPlugin, unknown>, RemarkConfigs>>([
    [AppendRemarkPlugin, { suffix: '|remark' }] as unknown as IPluggable<IRemarkPlugin, unknown>,
  ]);
  const rehypes = MutableState.of<PluginSet<IPluggable<IRehypePlugin, unknown>, RehypeConfigs>>([
    AppendRehypePlugin,
  ]);
  const repairs = MutableState.of<PluginSet<IPluggable<IRepairPlugin, unknown>, RepairConfigs>>([
    EndingMarkerRepairPlugin,
  ]);
  const renders = MutableState.of<
    IRenderPluggable<ElementContent, Parent, RenderedBlock, {}, unknown>[]
  >([]);
  const state = render(
    S([
      Core<RenderedBlock>,
      {
        Renderer: D(TestRenderer),
        text,
        patches,
        build,
        renders,
        remarks,
        rehypes,
        repairs,
      },
    ]),
  );

  return {
    build,
    patches,
    rehypes,
    remarks,
    renders,
    repairs,
    state,
    text,
  };
};

const stableAttacher: Plugin<[], Root, Root> = () => {
  return (tree) => {
    const paragraph = tree.children[0];

    if (paragraph?.type === 'paragraph') {
      paragraph.children.push({ type: 'text', value: '|enabled' });
    }
  };
};

beforeEach(() => {
  AppendRemarkPlugin.destroyed.mockClear();
  AppendRehypePlugin.destroyed.mockClear();
  EndingMarkerRepairPlugin.destroyed.mockClear();
  TestRenderPlugin.constructed.mockClear();
  TestRenderPlugin.destroyed.mockClear();
});

describe('Core', () => {
  test('exposes a reactive rendered value and preset plugin classes', () => {
    const harness = setupCore();

    const { state } = harness;

    expectTypeOf(state).toEqualTypeOf<IReadableClosure<RenderedBlock[]>>();

    expect(PRESET_REMARK_PLUGINS).toContain(SyntaxMathRemarkPlugin);
    expect(PRESET_REHYPE_PLUGINS).not.toContain(HoistFootnoteRehypePlugin);
    expect(PRESET_REPAIR_PLUGINS).toContain(DanglingFootnoteRepairPlugin);

    state.destroy();
  });

  test('builds from direct inputs with default plugin sources', () => {
    const state = render(
      S([
        Core<RenderedBlock>,
        {
          Renderer: D(TestRenderer),
          text: ReactiveState.of('base'),
          patches: [],
          build: DEFAULT_CONFIG,
          renders: [],
        },
      ]),
    );

    expect(collectText(getFirstBlockTree(state))).toBe('base');

    expect(state.value.closed).toBe(true);

    state.destroy();
  });

  test('configures the default syntax policy through a live remark map', () => {
    const remarks = MutableState.of<PluginSet<IPluggable<IRemarkPlugin, unknown>, RemarkConfigs>>({
      'remark-syntax-policy': { indentedCode: true },
    });

    const state = render(
      S([
        Core<RenderedBlock>,
        {
          Renderer: D(TestRenderer),
          text: ReactiveState.of('    code'),
          patches: [],
          build: DEFAULT_CONFIG,
          renders: [],
          remarks,
        },
      ]),
    );

    const initial = first(state.value.value);

    expect(
      findElement(getFirstBlockTree(state), (element) => {
        return element.tagName === 'pre';
      }),
    ).toBeDefined();

    remarks.next({ 'remark-syntax-policy': { indentedCode: false } });

    expect(first(state.value.value)).toBe(initial);

    expect(
      findElement(getFirstBlockTree(state), (element) => {
        return element.tagName === 'pre';
      }),
    ).toBeUndefined();

    remarks.next([]);

    expect(
      findElement(getFirstBlockTree(state), (element) => {
        return element.tagName === 'pre';
      }),
    ).toBeUndefined();

    state.destroy();

    remarks.destroy();
  });

  test('configures the default sanitizer through a live rehype map', () => {
    const rehypes = MutableState.of<PluginSet<IPluggable<IRehypePlugin, unknown>, RehypeConfigs>>({
      'rehype-sanitizer': { allowedProtocols: ['custom'] },
    });

    const state = render(
      S([
        Core<RenderedBlock>,
        {
          Renderer: D(TestRenderer),
          text: ReactiveState.of('[link](custom:example)'),
          patches: [],
          build: DEFAULT_CONFIG,
          renders: [],
          rehypes,
        },
      ]),
    );

    expect(
      findElement(getFirstBlockTree(state), (element) => {
        return element.tagName === 'a';
      })?.properties.href,
    ).toBe('custom:example');

    rehypes.next({});

    expect(
      findElement(getFirstBlockTree(state), (element) => {
        return element.tagName === 'a';
      })?.properties.href,
    ).toBeUndefined();

    state.destroy();

    rehypes.destroy();
  });

  test('uses the injected renderer and reacts to render plugin changes', () => {
    const harness = setupCore();
    const initial = first(harness.state.value.value);

    harness.renders.next([TestRenderPlugin]);

    const updated = first(harness.state.value.value);
    const plugin = first(updated?.renderPlugins ?? []);

    expect(updated).not.toBe(initial);
    expect(plugin).toBeInstanceOf(TestRenderPlugin);
    expect(TestRenderPlugin.constructed).toHaveBeenCalledTimes(1);

    harness.state.destroy();

    expect(TestRenderPlugin.destroyed).toHaveBeenCalledTimes(1);
  });

  test('reacts to configured extra pluggables while preserving block identity', () => {
    const harness = setupCore();
    const initialBlock = first(harness.state.value.value);

    expect(initialBlock).toBeDefined();
    expect(collectText(getBlockTree(initialBlock))).toBe('base|remark|rehype');

    harness.remarks.next([
      [AppendRemarkPlugin, { suffix: '|updated' }] as unknown as IPluggable<IRemarkPlugin, unknown>,
    ]);

    const configuredBlock = first(harness.state.value.value);

    expect(configuredBlock).toBe(initialBlock);
    expect(collectText(getBlockTree(configuredBlock))).toBe('base|updated|rehype');
    expect(AppendRemarkPlugin.destroyed).toHaveBeenCalledTimes(1);
    expect(AppendRehypePlugin.destroyed).not.toHaveBeenCalled();

    harness.remarks.next({});
    harness.rehypes.next({});

    const withoutExtras = first(harness.state.value.value);

    expect(withoutExtras).toBe(initialBlock);
    expect(collectText(getBlockTree(withoutExtras))).toBe('base');
    expect(AppendRemarkPlugin.destroyed).toHaveBeenCalledTimes(2);
    expect(AppendRehypePlugin.destroyed).toHaveBeenCalledTimes(1);
  });

  test('gates math and dangling-footnote behavior through build options', () => {
    const math = setupCore('$x$');

    math.remarks.next({});
    math.rehypes.next({});
    math.repairs.next({});

    expect(
      findElement(getFirstBlockTree(math.state), (element) => {
        return element.properties?.dataType === 'inline-math';
      }),
    ).toBeUndefined();

    math.build.next({ ...DEFAULT_CONFIG, tex: true });

    expect(
      findElement(getFirstBlockTree(math.state), (element) => {
        return element.properties?.dataType === 'inline-math';
      }),
    ).toBeDefined();

    const footnote = setupCore('first[^12');

    footnote.remarks.next({});
    footnote.rehypes.next({});
    footnote.repairs.next({});

    footnote.build.next({
      ...DEFAULT_CONFIG,
      repair: true,
      repairEnding: true,
      footnote: false,
    });

    const disabled = collectText(getFirstBlockTree(footnote.state));

    footnote.build.next({ ...footnote.build.value, footnote: true });

    const enabled = collectText(getFirstBlockTree(footnote.state));

    expect(disabled).toContain('[^12');
    expect(enabled).toBe('first');
  });

  test('lets framework-managed remark fields override user tuple options', () => {
    const harness = setupCore('abc');
    const renderPatch = jest.fn(() => {
      return first(harness.state.value.value)!;
    });

    harness.remarks.next([
      [
        PatchesRemarkPlugin,
        { patches: [{ key: 'ignored', range: [0, 0] }] },
      ] as unknown as IPluggable<IRemarkPlugin, unknown>,
    ]);
    harness.rehypes.next({});
    harness.patches.next([{ key: 'actual', range: [1, 1], render: renderPatch }]);

    const patchTree = getFirstBlockTree(harness.state);
    const renderedBlock = first(harness.state.value.value);

    expect(
      findElement(patchTree, (element) => {
        return element.properties?.dataPatchKey === 'actual';
      }),
    ).toBeDefined();
    expect(
      findElement(patchTree, (element) => {
        return element.properties?.dataPatchKey === 'ignored';
      }),
    ).toBeUndefined();
    expect(renderedBlock?.renderPatches.value).toEqual([{ key: 'actual', render: renderPatch }]);

    const updatedRenderPatch = jest.fn(() => {
      return renderedBlock!;
    });

    harness.patches.next([{ key: 'actual', range: [2, 2], render: updatedRenderPatch }]);

    const updatedTree = getFirstBlockTree(harness.state);
    const updatedParagraph = findElement(updatedTree, (element) => {
      return element.tagName === 'p';
    });

    expect(updatedParagraph?.children).toMatchObject([
      { type: 'text', value: 'ab' },
      { properties: { dataPatchKey: 'actual' }, type: 'element' },
      { type: 'text', value: 'c' },
    ]);
    expect(renderedBlock?.renderPatches.value).toEqual([
      { key: 'actual', render: updatedRenderPatch },
    ]);

    const math = setupCore('prefix$a+b');

    math.remarks.next([
      [SyntaxMathRemarkPlugin, { repairEnding: true }] as unknown as IPluggable<
        IRemarkPlugin,
        unknown
      >,
    ]);
    math.rehypes.next({});
    math.repairs.next({});

    math.build.next({ ...DEFAULT_CONFIG, tex: true, repairEnding: true });

    expect(
      findElement(getFirstBlockTree(math.state), (element) => {
        return element.properties?.dataType === 'inline-math';
      }),
    ).toBeUndefined();

    math.remarks.next([
      [SyntaxMathRemarkPlugin, { repairEnding: false }] as unknown as IPluggable<
        IRemarkPlugin,
        unknown
      >,
    ]);

    math.build.next({
      ...DEFAULT_CONFIG,
      tex: true,
      repair: true,
      repairEnding: true,
    });

    expect(
      findElement(getFirstBlockTree(math.state), (element) => {
        return element.properties?.dataType === 'inline-math';
      }),
    ).toBeDefined();

    const ending = setupCore('first\n\nsecond');

    ending.remarks.next([
      [ApplyRepairsRemarkPlugin, { ending: false, plugins: [] }] as unknown as IPluggable<
        IRemarkPlugin,
        unknown
      >,
    ]);
    ending.rehypes.next({});

    ending.build.next({ ...DEFAULT_CONFIG, repair: true, repairEnding: true });

    const values = ending.state.value.value.map((block) => {
      return collectText(block.value.value);
    });

    expect(values).toEqual(['first', 'second|ending']);
  });

  test('orders structural table repair before incomplete formulas without coupling their syntax', () => {
    const harness = setupCore('| $x$ | value');

    harness.remarks.next({});

    harness.rehypes.next({});

    harness.repairs.next({});

    harness.build.next({ ...DEFAULT_CONFIG, tex: true, repair: true, repairEnding: true });

    expect(
      harness.state.value.value
        .map((block) => {
          return collectText(block.value.value);
        })
        .join(''),
    ).toBe('');

    harness.text.next('| A | B |\n| --- | --- |\n| $x$ | `code');

    const tree = getFirstBlockTree(harness.state);

    expect(
      findElement(tree, (element) => {
        return element.properties?.dataType === 'inline-math';
      }),
    ).toBeDefined();

    expect(
      findElement(tree, (element) => {
        return element.tagName === 'code';
      }),
    ).toBeDefined();

    harness.state.destroy();
  });

  test('gates TeX prefix repair by math syntax and the ending-repair setting', () => {
    const harness = setupCore('$x+\\frac{a}{');

    harness.remarks.next({});

    harness.rehypes.next({});

    harness.repairs.next({});

    harness.build.next({ ...DEFAULT_CONFIG, tex: true, repair: true, repairEnding: true });

    const math = findElement(getFirstBlockTree(harness.state), (element) => {
      return element.properties?.dataType === 'inline-math';
    });

    expect(
      math?.children.some((child) => {
        return child.data?.repairEnding === true;
      }),
    ).toBe(true);

    harness.build.next({ ...DEFAULT_CONFIG, tex: true, repair: true, repairEnding: false });

    expect(collectText(getFirstBlockTree(harness.state))).toBe('$x+\\frac{a}{');

    harness.build.next({ ...DEFAULT_CONFIG, tex: true, repair: true, repairEnding: true });

    harness.remarks.next({ 'remark-syntax-math': { disabled: true } });

    expect(
      findElement(getFirstBlockTree(harness.state), (element) => {
        return element.properties?.dataType === 'inline-math';
      }),
    ).toBeUndefined();

    harness.state.destroy();
  });

  test('reuses candidates and rebuilds the processor when enablement changes', () => {
    const constructed = jest.fn();

    const setup = jest.fn(stableAttacher);

    class ContextRemarkPlugin extends BaseRemarkPlugin {
      static readonly key = 'remark-test-context-enabled';

      plugin = setup;

      constructor() {
        super();

        constructed();
      }

      override enabled({ config }: RemarkPluginEnabledContext): boolean {
        return config.tex;
      }
    }

    const harness = setupCore('text');

    harness.remarks.next([ContextRemarkPlugin]);

    harness.rehypes.next({});

    expect(collectText(getFirstBlockTree(harness.state))).toBe('text');

    expect(constructed).toHaveBeenCalledTimes(1);

    expect(setup).not.toHaveBeenCalled();

    harness.build.next({ ...DEFAULT_CONFIG, tex: true });

    expect(collectText(getFirstBlockTree(harness.state))).toBe('text|enabled');

    expect(setup).toHaveBeenCalledTimes(1);

    harness.build.next(DEFAULT_CONFIG);

    expect(collectText(getFirstBlockTree(harness.state))).toBe('text');

    expect(constructed).toHaveBeenCalledTimes(1);

    expect(setup).toHaveBeenCalledTimes(1);

    harness.state.destroy();
  });

  test('does not construct repair plugins while the global repair switch is disabled', () => {
    const constructed = jest.fn();

    const configured = jest.fn();

    class OptionalRepairPlugin extends BaseRepairPlugin {
      static readonly key = 'repair-test-optional';

      constructor() {
        super();

        constructed();
      }

      static override config(): null {
        configured();

        return null;
      }

      override runner: RepairPluginRunner = () => {};
    }

    const harness = setupCore('text');

    harness.repairs.next([OptionalRepairPlugin]);

    expect(collectText(getFirstBlockTree(harness.state))).toBe('text|remark|rehype');

    expect(constructed).not.toHaveBeenCalled();

    expect(configured).not.toHaveBeenCalled();

    harness.build.next({ ...DEFAULT_CONFIG, repair: true });

    expect(collectText(getFirstBlockTree(harness.state))).toBe('text|remark|rehype');

    expect(constructed).toHaveBeenCalledTimes(1);

    expect(configured).toHaveBeenCalledTimes(1);

    harness.state.destroy();
  });

  test('resolves constructor options before building and caches the resolved options', () => {
    const constructed = jest.fn();

    const configured = jest.fn();

    class ConfiguredRemarkPlugin extends AppendRemarkPlugin {
      constructor(config: AppendRemarkPluginConfig = {}) {
        super(config);

        constructed(config);
      }

      static override config(
        context: RemarkPluginConfigContext,
        outerConfig: IPluggableConfig<AppendRemarkPluginConfig>,
      ): IPluggableConfig<AppendRemarkPluginConfig> {
        configured(context, outerConfig);

        return {
          ...outerConfig,
          suffix: `${outerConfig.suffix}|${context.config.tex ? 'tex' : 'plain'}`,
        };
      }
    }

    const options = { suffix: '|outer', priority: PluginPriority.Lowest };

    const harness = setupCore('text');

    harness.remarks.next([[ConfiguredRemarkPlugin, options]]);

    harness.rehypes.next({});

    expect(collectText(getFirstBlockTree(harness.state))).toBe('text|outer|plain');

    expect(constructed).toHaveBeenCalledTimes(1);

    expect(constructed).toHaveBeenLastCalledWith({ ...options, suffix: '|outer|plain' });

    expect(configured).toHaveBeenLastCalledWith(
      expect.objectContaining({
        remarks: expect.arrayContaining([[ConfiguredRemarkPlugin, options]]),
        repairs: [],
      }),
      options,
    );

    harness.build.next({ ...DEFAULT_CONFIG, tex: true });

    expect(collectText(getFirstBlockTree(harness.state))).toBe('text|outer|tex');

    expect(constructed).toHaveBeenCalledTimes(2);

    harness.build.next({ ...DEFAULT_CONFIG, tex: true, footnote: true });

    expect(collectText(getFirstBlockTree(harness.state))).toBe('text|outer|tex');

    expect(constructed).toHaveBeenCalledTimes(2);

    expect(options).toEqual({ suffix: '|outer', priority: PluginPriority.Lowest });

    harness.state.destroy();
  });

  test('preserves outer options for null and filters configured disabled plugins before construction', () => {
    const skipped = jest.fn();

    const constructed = jest.fn();

    const configured = jest.fn();

    class DisabledRemarkPlugin extends BaseRemarkPlugin {
      static readonly key = 'remark-test-config-disabled';

      override plugin = stableAttacher;

      static override config(): null {
        skipped();

        return null;
      }
    }

    class DynamicRemarkPlugin extends BaseRemarkPlugin {
      static readonly key = 'remark-test-config-dynamic';

      override plugin = stableAttacher;

      constructor() {
        super();

        constructed();
      }

      static override config(
        { config }: RemarkPluginConfigContext,
        outerConfig: IPluggableConfig<unknown>,
      ): IPluggableConfig<unknown> {
        return { ...outerConfig, disabled: !config.tex };
      }
    }

    class NullRemarkPlugin extends AppendRemarkPlugin {
      static override config(
        _context: RemarkPluginConfigContext,
        outerConfig: IPluggableConfig<AppendRemarkPluginConfig>,
      ): null {
        configured(outerConfig);

        return null;
      }
    }

    const options = { suffix: '|after', priority: PluginPriority.Lowest };

    const harness = setupCore('text');

    harness.remarks.next([
      [DisabledRemarkPlugin, { disabled: true }],
      DynamicRemarkPlugin,
      [NullRemarkPlugin, options],
    ]);

    harness.rehypes.next({});

    expect(collectText(getFirstBlockTree(harness.state))).toBe('text|after');

    expect(skipped).not.toHaveBeenCalled();

    expect(constructed).not.toHaveBeenCalled();

    expect(configured).toHaveBeenLastCalledWith(options);

    harness.build.next({ ...DEFAULT_CONFIG, tex: true });

    expect(collectText(getFirstBlockTree(harness.state))).toBe('text|enabled|after');

    expect(constructed).toHaveBeenCalledTimes(1);

    expect(skipped).not.toHaveBeenCalled();

    harness.build.next(DEFAULT_CONFIG);

    expect(collectText(getFirstBlockTree(harness.state))).toBe('text|after');

    expect(options).toEqual({ suffix: '|after', priority: PluginPriority.Lowest });

    harness.state.destroy();
  });

  test('evaluates repair enablement with block-specific configuration and original descriptors', () => {
    const contexts: RepairPluginEnabledContext[] = [];

    const configurations: RepairPluginConfigContext[] = [];

    const remarkConfigurations: RemarkPluginConfigContext[] = [];

    class ContextRepairPlugin extends BaseRepairPlugin {
      static readonly key = 'repair-test-context';

      static override config(context: RepairPluginConfigContext): null {
        configurations.push(context);

        return null;
      }

      override enabled(context: RepairPluginEnabledContext): boolean {
        contexts.push(context);

        return context.config.repairEnding;
      }

      runner: RepairPluginRunner = ({ node }) => {
        if (node.type !== 'root') {
          return;
        }

        node.children.push({
          type: 'paragraph',
          children: [{ type: 'text', value: '|tail' }],
        });
      };
    }

    class ContextRemarkPlugin extends BaseRemarkPlugin {
      static readonly key = 'remark-test-repair-config-context';

      override plugin: Plugin<[], Root, Root> = () => {};

      static override config(context: RemarkPluginConfigContext): null {
        remarkConfigurations.push(context);

        return null;
      }
    }

    const harness = setupCore('first\n\nsecond');

    harness.remarks.next([...PRESET_REMARK_PLUGINS, ContextRemarkPlugin]);

    harness.rehypes.next({});

    harness.repairs.next([ContextRepairPlugin]);

    harness.build.next({ ...DEFAULT_CONFIG, repair: true, repairEnding: true });

    expect(
      harness.state.value.value.map((block) => {
        return collectText(block.value.value);
      }),
    ).toEqual(['first', 'second\n|tail']);

    expect(
      contexts.map((context) => {
        return context.config.repairEnding;
      }),
    ).toEqual([false, true]);

    expect(configurations.map((context) => context.config.repairEnding)).toEqual([false, true]);

    expect(
      remarkConfigurations.map((context) => {
        return context.repairs.some((plugin) => plugin instanceof ContextRepairPlugin);
      }),
    ).toEqual([false, true]);

    expect(
      contexts.every((context) => {
        return context.repairs.includes(ContextRepairPlugin);
      }),
    ).toBe(true);

    expect(
      contexts.every((context) => {
        return context.remarks.includes(ApplyRepairsRemarkPlugin);
      }),
    ).toBe(true);

    harness.text.next('first\n\nsecond\n\nthird');

    expect(
      harness.state.value.value.map((block) => {
        return collectText(block.value.value);
      }),
    ).toEqual(['first', 'second', 'third\n|tail']);

    harness.state.destroy();
  });

  test('coordinates syntax-dependent repairs through constructor options', () => {
    const harness = setupCore('~tail');

    harness.remarks.next({});

    harness.rehypes.next({});

    harness.repairs.next({});

    harness.build.next({ ...DEFAULT_CONFIG, repair: true, repairEnding: true });

    expect(
      findElement(getFirstBlockTree(harness.state), (node) => {
        return node.tagName === 'del';
      }),
    ).toBeDefined();

    harness.remarks.next({ 'remark-syntax-strikethrough': { singleTilde: false } });

    expect(collectText(getFirstBlockTree(harness.state))).toBe('~tail');

    harness.remarks.next({ 'remark-syntax-strikethrough': { disabled: true } });

    harness.text.next('~~tail');

    expect(collectText(getFirstBlockTree(harness.state))).toBe('~~tail');

    harness.text.next('| header |');

    harness.remarks.next({});

    expect(
      harness.state.value.value
        .map((block) => {
          return collectText(block.value.value);
        })
        .join(''),
    ).toBe('');

    harness.remarks.next({ 'remark-syntax-table': { disabled: true } });

    expect(collectText(getFirstBlockTree(harness.state))).toBe('| header |');

    harness.state.destroy();
  });

  test('reacts to enabled repair extras, their configs, and list changes', () => {
    const harness = setupCore('base');

    harness.remarks.next({});
    harness.rehypes.next({});

    expect(collectText(getFirstBlockTree(harness.state))).toBe('base');

    harness.build.next({
      ...DEFAULT_CONFIG,
      repair: true,
      repairEnding: true,
    });

    expect(collectText(getFirstBlockTree(harness.state))).toBe('base|ending');

    harness.repairs.next([]);

    expect(collectText(getFirstBlockTree(harness.state))).toBe('base');
    expect(EndingMarkerRepairPlugin.destroyed).toHaveBeenCalledTimes(1);

    harness.repairs.next([
      [EndingMarkerRepairPlugin, { marker: '|configured' }] as unknown as IPluggable<
        IRepairPlugin,
        unknown
      >,
    ]);

    expect(collectText(getFirstBlockTree(harness.state))).toBe('base|configured');
    expect(EndingMarkerRepairPlugin.destroyed).toHaveBeenCalledTimes(1);
  });

  test('configures default repair plugins through a live configuration map', () => {
    const harness = setupCore('prefix ![tail');

    harness.remarks.next({});
    harness.rehypes.next({});
    harness.repairs.next({
      'repair-incomplete-image': { strategy: 'discard' },
    });

    harness.build.next({
      ...DEFAULT_CONFIG,
      repair: true,
      repairEnding: true,
    });

    const tree = getFirstBlockTree(harness.state);

    expect(
      findElement(tree, (element) => {
        return element.tagName === 'img';
      }),
    ).toBeUndefined();
    expect(collectText(tree)).toBe('prefix ');

    harness.repairs.next({ 'repair-incomplete-image': { strategy: 'placeholder' } });

    expect(
      findElement(getFirstBlockTree(harness.state), (element) => {
        return element.tagName === 'img';
      }),
    ).toMatchObject({ properties: { alt: 'tail' } });

    harness.state.destroy();
  });

  test('keeps the compiled block graph reactive without taking ownership of inputs', () => {
    const harness = setupCore('first\n\nsecond');
    const initial = harness.state.value.value;

    harness.text.next('updated\n\nsecond\n\nthird');

    const updated = harness.state.value.value;

    expect(updated).toHaveLength(3);
    expect(first(updated)).toBe(first(initial));
    expect(nth(updated, 1)).toBe(nth(initial, 1));
    expect(
      updated.map((block) => {
        return collectText(block.value.value);
      }),
    ).toEqual(['updated|remark|rehype', 'second|remark|rehype', 'third|remark|rehype']);

    const inputs = [
      harness.text,
      harness.patches,
      harness.build,
      harness.remarks,
      harness.rehypes,
      harness.renders,
      harness.repairs,
    ];

    expect(
      inputs.every((state) => {
        return countStateObservers(state) > 0;
      }),
    ).toBe(true);

    harness.state.destroy();
    harness.state.destroy();

    expect(harness.state.value).toBeDefined();
    expect(harness.text.closed).toBe(false);
    expect(harness.patches.closed).toBe(false);

    expect(harness.build.closed).toBe(false);
    expect(harness.remarks.closed).toBe(false);
    expect(harness.rehypes.closed).toBe(false);
    expect(harness.renders.closed).toBe(false);
    expect(harness.repairs.closed).toBe(false);
    expect(inputs.map(countStateObservers)).toEqual(
      inputs.map(() => {
        return 0;
      }),
    );
    expect(AppendRemarkPlugin.destroyed).toHaveBeenCalledTimes(1);
    expect(AppendRehypePlugin.destroyed).toHaveBeenCalledTimes(1);
  });

  test('releases per-block descriptor scopes while preserving shared plugin instances', () => {
    const harness = setupCore('first\n\nsecond\n\nthird');

    expect(harness.state.value.value).toHaveLength(3);

    const initialRemarkObservers = countStateObservers(harness.remarks);

    expect(initialRemarkObservers).toBe(1);

    harness.text.next('first');

    expect(harness.state.value.value).toHaveLength(1);
    expect(countStateObservers(harness.remarks)).toBe(initialRemarkObservers);
    expect(AppendRemarkPlugin.destroyed).not.toHaveBeenCalled();

    harness.text.next('first\n\nfourth');

    expect(harness.state.value.value).toHaveLength(2);
    expect(countStateObservers(harness.remarks)).toBe(initialRemarkObservers);
    expect(AppendRemarkPlugin.destroyed).not.toHaveBeenCalled();

    harness.state.destroy();

    expect(AppendRemarkPlugin.destroyed).toHaveBeenCalledTimes(1);
    expect(AppendRehypePlugin.destroyed).toHaveBeenCalledTimes(1);
  });

  test('shares repair instances with unchanged options across block lifetimes', () => {
    const harness = setupCore('first\n\nsecond');

    harness.remarks.next({});
    harness.rehypes.next({});

    harness.build.next({
      ...DEFAULT_CONFIG,
      repair: true,
      repairEnding: true,
    });

    expect(
      harness.state.value.value.map((block) => {
        return collectText(block.value.value);
      }),
    ).toEqual(['first', 'second|ending']);
    expect(EndingMarkerRepairPlugin.destroyed).not.toHaveBeenCalled();

    harness.text.next('first');

    expect(EndingMarkerRepairPlugin.destroyed).toHaveBeenCalledTimes(0);

    harness.text.next('');

    expect(harness.state.value.value).toEqual([]);
    expect(EndingMarkerRepairPlugin.destroyed).toHaveBeenCalledTimes(1);

    harness.text.next('rebuilt');

    expect(collectText(getFirstBlockTree(harness.state))).toBe('rebuilt|ending');
    expect(EndingMarkerRepairPlugin.destroyed).toHaveBeenCalledTimes(1);

    harness.state.destroy();

    expect(EndingMarkerRepairPlugin.destroyed).toHaveBeenCalledTimes(2);
    expect(harness.repairs.closed).toBe(false);
  });

  test('destroying before initialization builds no graph', () => {
    const harness = setupCore();

    harness.state.destroy();
    harness.state.destroy();

    expect(() => {
      return harness.state.value;
    }).toThrow('Cannot set up a destroyed state closure.');
    expect(AppendRemarkPlugin.destroyed).not.toHaveBeenCalled();
    expect(AppendRehypePlugin.destroyed).not.toHaveBeenCalled();
  });
});

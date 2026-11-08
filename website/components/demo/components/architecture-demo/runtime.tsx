import type { BlockRemarksConfig, MapperPluggable } from '@fluxdown/core';

import {
  BaseRenderer,
  BlockCompiler,
  ChunkerConfig,
  MapperComposer,
  PluginBuilder,
  PluginCacheStore,
  RehypePluggables,
  RemarkPlugins,
  RepairPluggables,
  TextChunker,
} from '@fluxdown/core';
import { Smooth } from '@fluxdown/core-plugins/plugins/mapper/smooth';
import { D, type IReadableClosure, MutableState, render, renderHooks, S, useCreate } from 'stative';

import type { Block, HastElement, HastNode, RenderOutput, TreeSnapshot } from './type';

import { diffTree } from './diff';
import { DemoSpringInterpolator } from './interpolator';
import { MarkdownTree } from './views';

class DemoRenderer extends BaseRenderer<
  Block['value']['value'],
  HastNode,
  HastElement | Block['value']['value'],
  RenderOutput
> {
  protected override render(): IReadableClosure<RenderOutput[]> {
    return this.map<IReadableClosure<RenderOutput[]>, RenderOutput[]>(
      super.render(),
      (items, previous) => {
        const retained = new Set(items.map(({ content }) => content));

        for (const { content } of previous?.[0] ?? []) {
          if (!retained.has(content)) {
            this.release(content);
          }
        }

        return items;
      },
    );
  }

  protected renderItem(block: Block): RenderOutput {
    let previous: TreeSnapshot | undefined;

    return {
      key: block.meta.value.key,
      content: this.map(block, (tree) => {
        previous = diffTree(tree, previous);
        return <MarkdownTree snapshot={previous} />;
      }),
    };
  }
}

const BUILD = {
  repair: true,
  repairEnding: true,
  footnote: false,
  tex: false,
  indentedCode: false,
  setextHeading: false,
};

export const createPipeline = (smooth: boolean) => {
  const text = MutableState.of('');
  const scope = renderHooks(() => {
    const cacheStore = new PluginCacheStore();
    const repairs = RepairPluggables({ config: BUILD, extras: [] });
    const rehypeState = useCreate(
      S([
        () =>
          PluginBuilder({ cacheStore, plugins: RehypePluggables({ config: BUILD, extras: [] }) }),
        {},
      ]),
    );
    const buildRemarks = ({ config }: { config: BlockRemarksConfig }) =>
      RemarkPlugins({ config, extras: [], repairs, cacheStore });
    const config = useCreate(D(BUILD));
    const sections = TextChunker({
      text: useCreate(text),
      config: useCreate(S([ChunkerConfig, { config }])),
      patches: useCreate(D([])),
    });
    const compiled = BlockCompiler({
      sections,
      config,
      getRemarks: ({ config: blockConfig }) => render(S([buildRemarks, { config: blockConfig }])),
      getRehypes: () => rehypeState,
    });
    const mapped = MapperComposer({
      source: compiled,
      mappers: useCreate(
        D<MapperPluggable[]>([
          [Smooth, { enabled: smooth, interpolation: DemoSpringInterpolator }],
        ]),
      ),
    });
    const rendered = useCreate(S([DemoRenderer, { source: mapped, patches: [], plugins: [] }]));

    return { sections, compiled, mapped, rendered };
  });

  return {
    text,
    ...scope.value.value,
    destroy() {
      scope.destroy();
      text.destroy();
    },
  };
};

/**
 * @jsxImportSource stative
 */

import type { IRehypePlugin } from '@fluxdown/types';
import type { ElementContent, Parent } from 'hast';

import { D, type JSXDescriptor, once, useCreate, useDefaults } from 'stative';

import type { IRenderPlugin } from '../../externals';
import type { CoreInputs } from './type';

import { MapperComposer, PluginBuilder, PluginCacheStore, TextChunker } from '../base';
import { BlockCompiler } from '../hast';
import {
  ChunkerConfig,
  MapperPluggables,
  RawPatchesMapper,
  RehypePluggables,
  RemarkPlugins,
  RenderPatchesMapper,
  RenderPluggables,
  RepairPluggables,
} from './states';

export * from './states';
export * from './type';

export const Core = /*#__PURE__*/ once(function Core<R, C = {}>({
  Renderer,
  text,
  patches,
  build,
  renders,
  remarks,
  rehypes,
  repairs,
  mappers,
}: CoreInputs<R, C>): JSXDescriptor<R[]> {
  const cacheStore = new PluginCacheStore();

  const remarkSources = useDefaults(remarks, {});

  const rehypeSources = useDefaults(rehypes, {});

  const repairSources = useDefaults(repairs, {});

  const mapperSources = useDefaults(mappers, {});

  const repairPluggables = useCreate(<RepairPluggables config={build} extras={repairSources} />);

  const rehypePluggables = useCreate(<RehypePluggables config={build} extras={rehypeSources} />);

  return (
    <Renderer
      patches={<RenderPatchesMapper<R> patches={patches} />}
      plugins={
        <PluginBuilder<IRenderPlugin<ElementContent, Parent, R, C>>
          cacheStore={D(cacheStore)}
          plugins={<RenderPluggables<ElementContent, Parent, R, C> extras={renders} />}
        />
      }
      source={
        <MapperComposer
          mappers={<MapperPluggables extras={mapperSources} />}
          source={
            <BlockCompiler
              sections={
                <TextChunker
                  text={text}
                  config={<ChunkerConfig config={build} />}
                  patches={<RawPatchesMapper<R> patches={patches} />}
                />
              }
              config={build}
              getRemarks={({ config }) => (
                <RemarkPlugins
                  cacheStore={D(cacheStore)}
                  config={config}
                  extras={remarkSources}
                  repairs={repairPluggables}
                />
              )}
              getRehypes={() => (
                <PluginBuilder<IRehypePlugin>
                  cacheStore={D(cacheStore)}
                  plugins={rehypePluggables}
                />
              )}
            />
          }
        />
      }
    />
  );
});

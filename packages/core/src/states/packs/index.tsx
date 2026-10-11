/**
 * @jsxImportSource stative
 */

import type { ElementContent, Parent } from 'hast';

import { type JSXDescriptor, once, S, useCreate, useDefaults } from 'stative';

import type { IRenderPlugin } from '../../externals';
import type { CoreInputs } from './type';

import { MapperComposer, PluginBuilder, TextChunker } from '../base';
import {
  ChunkerConfig,
  DocumentCompiler,
  DocumentPlugins,
  MapperPluggables,
  RawPatchesMapper,
  RenderPatchesMapper,
  RenderPluggables,
} from './states';

export {
  ChunkerConfig,
  type ChunkerConfigInputs,
  MapperPluggables,
  type MapperPluggablesInputs,
  RawPatchesMapper,
  type RawPatchesMapperInputs,
  RehypePluggables,
  type RehypePluggablesInputs,
  RemarkPluggables,
  type RemarkPluggablesInputs,
  RenderPatchesMapper,
  type RenderPatchesMapperInputs,
  RenderPluggables,
  type RenderPluggablesInputs,
  RepairPluggables,
  type RepairPluggablesInputs,
} from './states';
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
  const remarkSources = useDefaults(remarks, {});

  const rehypeSources = useDefaults(rehypes, {});

  const repairSources = useDefaults(repairs, {});

  const mapperSources = useDefaults(mappers, {});

  const plugins = useCreate(
    S([
      DocumentPlugins,
      {
        config: build,
        remarks: remarkSources,
        rehypes: rehypeSources,
        repairs: repairSources,
      },
    ]),
  );

  return (
    <Renderer
      patches={<RenderPatchesMapper<R> patches={patches} />}
      plugins={
        <PluginBuilder<IRenderPlugin<ElementContent, Parent, R, C>>
          plugins={<RenderPluggables<ElementContent, Parent, R, C> extras={renders} />}
        />
      }
      source={
        <MapperComposer
          mappers={<MapperPluggables extras={mapperSources} />}
          source={
            <DocumentCompiler
              sections={
                <TextChunker
                  text={text}
                  config={<ChunkerConfig config={build} />}
                  patches={<RawPatchesMapper<R> patches={patches} />}
                />
              }
              config={build}
              plugins={plugins}
            />
          }
        />
      }
    />
  );
});

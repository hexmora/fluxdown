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
  MapperPluggables,
  RawPatchesMapper,
  RenderPatchesMapper,
  RenderPluggables,
} from './states';
import { BlockCompiler, type BlockCompilerInputs } from '../hast';
import { DocumentPlugins } from './states/document-plugins';

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

  const getRemarks: BlockCompilerInputs['getRemarks'] = ({ config }) =>
    plugins.createRemarkScope(config);

  const getRehypes = () => plugins.createRehypeScope();

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
            <BlockCompiler
              sections={
                <TextChunker
                  text={text}
                  config={<ChunkerConfig config={build} />}
                  patches={<RawPatchesMapper<R> patches={patches} />}
                />
              }
              config={build}
              getRemarks={getRemarks}
              getRehypes={getRehypes}
            />
          }
        />
      }
    />
  );
});

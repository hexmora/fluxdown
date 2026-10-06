/** @jsxImportSource stative */

import type { IPluggable, IRehypePlugin, IRemarkPlugin, IRepairPlugin } from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

import { PRESET_REHYPE_PLUGINS } from '@fluxdown/core-presets/rehype';
import { PRESET_REMARK_PLUGINS } from '@fluxdown/core-presets/remark';
import { PRESET_REPAIR_PLUGINS } from '@fluxdown/core-presets/repair';
import { isArray, isEqual } from 'lodash-es';
import { BaseStateClosure, render, S } from 'stative';

import type { BlockRemarksConfig } from '../../../hast';
import type { DocumentPluginsInputs, DocumentPluginSources } from './type';

import { PluginBuilder, toPluggable } from '../../../base';
import { RehypePluggables } from '../rehype-pluggables';
import { RemarkPluggables } from '../remark-pluggables';
import { RepairPluggables } from '../repair-pluggables';
import { getPluggableClass } from '../utils';
import { SHARED_REHYPE_PLUGINS, SHARED_REMARK_PLUGINS, SHARED_REPAIR_PLUGINS } from './consts';
import { PresetSnapshot } from './presets';
import { RehypeScope, RemarkScope } from './scopes';
import { isShareablePluginConfig, isShareablePluginSet } from './utils';

export class DocumentPlugins extends BaseStateClosure<
  DocumentPluginSources,
  DocumentPluginsInputs
> {
  private readonly remarkPresets = new PresetSnapshot([
    PRESET_REMARK_PLUGINS,
    PRESET_REPAIR_PLUGINS,
  ]);

  private readonly rehypePresets = new PresetSnapshot([PRESET_REHYPE_PLUGINS]);

  protected override get outputMode() {
    return 'view' as const;
  }

  createRemarkScope(config: IReadableClosure<BlockRemarksConfig>) {
    // Initialize shared eligibility before checking the current preset snapshot.
    void this.value.value;

    this.hasCurrentRemarkPresets();

    return render(S([RemarkScope, { provider: this, config }]));
  }

  createRehypeScope() {
    void this.value.value;

    this.hasCurrentRehypePresets();

    return render(S([RehypeScope, { provider: this }]));
  }

  hasCurrentRemarkPresets() {
    return this.remarkPresets.matches();
  }

  hasCurrentRehypePresets() {
    return this.rehypePresets.matches();
  }

  createPrivateRemarks(config: IReadableClosure<BlockRemarksConfig>) {
    const { remarks, repairs } = this.inputs;

    return (
      <PluginBuilder<IRemarkPlugin>
        plugins={
          <RemarkPluggables
            config={config}
            extras={remarks}
            repairs={
              <PluginBuilder<IRepairPlugin>
                plugins={<RepairPluggables config={config} extras={repairs} />}
              />
            }
          />
        }
      />
    );
  }

  createPrivateRehypes() {
    const { config, rehypes } = this.inputs;

    return (
      <PluginBuilder<IRehypePlugin>
        plugins={<RehypePluggables config={config} extras={rehypes} />}
      />
    );
  }

  protected render() {
    const { config, remarks, repairs } = this.inputs;

    const shareRemarks = this.combineMap(
      [config, remarks, repairs],
      ([current, extras, repairExtras]) => {
        if (
          !this.remarkPresets.matches() ||
          !isShareablePluginConfig(current) ||
          !isShareablePluginSet(PRESET_REMARK_PLUGINS) ||
          !isShareablePluginSet(PRESET_REPAIR_PLUGINS) ||
          !isShareablePluginSet(extras) ||
          !isShareablePluginSet(repairExtras)
        ) {
          return false;
        }

        return (
          toPluggable(extras, PRESET_REMARK_PLUGINS).every((plugin) =>
            SHARED_REMARK_PLUGINS.includes(getPluggableClass(plugin)),
          ) &&
          toPluggable(repairExtras, PRESET_REPAIR_PLUGINS).every((plugin) =>
            SHARED_REPAIR_PLUGINS.includes(getPluggableClass(plugin)),
          )
        );
      },
    );

    const repairInputs = this.combineMap([repairs, shareRemarks], ([current, shared]) =>
      shared ? current : [],
    );

    const repairPluggables = this.create<IPluggable<IRepairPlugin, unknown>[]>(
      <RepairPluggables config={config} extras={repairInputs} />,
    );

    const sharedRepairs = this.create<IRepairPlugin[]>(
      <PluginBuilder<IRepairPlugin>
        plugins={this.combineMap([repairPluggables, shareRemarks], ([current, shared]) =>
          shared &&
          this.hasCurrentRemarkPresets() &&
          isShareablePluginSet(PRESET_REPAIR_PLUGINS) &&
          current.every((plugin) => SHARED_REPAIR_PLUGINS.includes(getPluggableClass(plugin)))
            ? current
            : [],
        )}
      />,
    );

    const remarkInputs = this.combineMap([remarks, shareRemarks], ([current, shared]) =>
      shared ? current : [],
    );

    const sealed = this.createSharedRemarks(false, remarkInputs, sharedRepairs, shareRemarks);

    const ending = this.createSharedRemarks(true, remarkInputs, sharedRepairs, shareRemarks);

    const { shared: rehypes, shareable: shareRehypes } = this.createSharedRehypes();

    return this.combineMap([shareRemarks, shareRehypes], ([canShareRemarks, canShareRehypes]) => ({
      sealed,
      ending,
      rehypes,
      shareRemarks: canShareRemarks,
      shareRehypes: canShareRehypes,
    }));
  }

  private createSharedRemarks(
    repairEnding: boolean,
    extras: DocumentPluginsInputs['remarks'],
    repairs: IReadableClosure<IRepairPlugin[]>,
    shareable: IReadableClosure<boolean>,
  ) {
    const settings = this.map(
      this.inputs.config,
      (current): BlockRemarksConfig => ({
        ...current,
        repairEnding: repairEnding && current.repairEnding,
        patches: [],
      }),
      isEqual,
    );

    const pluggables = this.create<IPluggable<IRemarkPlugin, unknown>[]>(
      <RemarkPluggables config={settings} extras={extras} repairs={repairs} />,
    );

    const plugins = this.combineMap([pluggables, shareable], ([current, shared]) =>
      shared &&
      this.hasCurrentRemarkPresets() &&
      isShareablePluginSet(PRESET_REMARK_PLUGINS) &&
      current.every((plugin) => SHARED_REMARK_PLUGINS.includes(getPluggableClass(plugin)))
        ? current
        : [],
    );

    return this.create<IRemarkPlugin[]>(<PluginBuilder<IRemarkPlugin> plugins={plugins} />);
  }

  private createSharedRehypes() {
    const { config, rehypes } = this.inputs;

    const sharedExtras = this.combineMap([config, rehypes], ([currentConfig, current]) => {
      return this.rehypePresets.matches() &&
        isShareablePluginSet(PRESET_REHYPE_PLUGINS) &&
        isShareablePluginConfig(currentConfig) &&
        isShareablePluginSet(current)
        ? current
        : null;
    });

    const extras = this.map(sharedExtras, (current) => current ?? []);

    const pluggables = this.create<IPluggable<IRehypePlugin, unknown>[]>(
      <RehypePluggables config={config} extras={extras} />,
    );

    const sharedInputs = this.combineMap([pluggables, sharedExtras], ([current, inputs]) => {
      return inputs !== null &&
        this.hasCurrentRehypePresets() &&
        isShareablePluginSet(PRESET_REHYPE_PLUGINS) &&
        current.every(
          (plugin) =>
            SHARED_REHYPE_PLUGINS.includes(getPluggableClass(plugin)) &&
            (!isArray(plugin) || isShareablePluginConfig(plugin[1])),
        )
        ? current
        : null;
    });

    const shareable = this.select(sharedInputs, (current) => current !== null);

    const plugins = this.map(sharedInputs, (current) => current ?? []);

    return {
      shared: this.create<IRehypePlugin[]>(<PluginBuilder<IRehypePlugin> plugins={plugins} />),
      shareable,
    };
  }
}

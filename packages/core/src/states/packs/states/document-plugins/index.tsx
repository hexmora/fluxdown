/** @jsxImportSource stative */

import type { IPluggable, IRehypePlugin, IRemarkPlugin, IRepairPlugin } from '@fluxdown/types';
import type { IReadableClosure, StateClosureMode } from 'stative';

import { PRESET_REHYPE_PLUGINS } from '@fluxdown/core-presets/rehype';
import { PRESET_REMARK_PLUGINS } from '@fluxdown/core-presets/remark';
import { PRESET_REPAIR_PLUGINS } from '@fluxdown/core-presets/repair';
import { isEqual } from 'lodash-es';
import { BaseStateClosure, render, S } from 'stative';

import type { BlockRemarksConfig } from '../../../hast';
import type { DocumentPluginsInputs, DocumentPluginSources, RemarkPluginSet } from './type';

import { PluginBuilder } from '../../../base';
import { RehypePluggables } from '../rehype-pluggables';
import { RemarkPluggables } from '../remark-pluggables';
import { RepairPluggables } from '../repair-pluggables';
import { RehypeScope, RemarkScope } from './states';
import {
  isShareableRehypeInputs,
  isShareableRehypePluggables,
  isShareableRemarkInputs,
  isShareableRemarkPluggables,
  isShareableRepairPluggables,
  PresetSnapshot,
} from './utils';

export class DocumentPlugins extends BaseStateClosure<
  DocumentPluginSources,
  DocumentPluginsInputs
> {
  private readonly remarkPresets = new PresetSnapshot([
    PRESET_REMARK_PLUGINS,
    PRESET_REPAIR_PLUGINS,
  ]);

  private readonly rehypePresets = new PresetSnapshot([PRESET_REHYPE_PLUGINS]);

  protected override get mode(): StateClosureMode {
    return 'view';
  }

  createRemarkScope(config: IReadableClosure<BlockRemarksConfig>) {
    // Initialize shared eligibility before checking the current preset snapshot.
    void this.value.value;

    this.remarkPresets.matches();

    return render(S([RemarkScope, { provider: this, config }]));
  }

  createRehypeScope() {
    void this.value.value;

    this.rehypePresets.matches();

    return render(S([RehypeScope, { provider: this }]));
  }

  getSharedRemarks(config: BlockRemarksConfig, { sealed, ending }: DocumentPluginSources) {
    if (!this.remarkPresets.matches() || !sealed || config.patches.length > 0) {
      return null;
    }

    return config.repairEnding ? ending : sealed;
  }

  getSharedRehypes({ rehypes }: DocumentPluginSources) {
    return this.rehypePresets.matches() ? rehypes : null;
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

    const shareRemarks = this.map(
      [config, remarks, repairs],
      ([current, extras, repairExtras]) =>
        this.remarkPresets.matches() && isShareableRemarkInputs(current, extras, repairExtras),
    );

    const repairInputs = this.map([repairs, shareRemarks], ([current, shared]) =>
      shared ? current : [],
    );

    const repairPluggables = this.create<IPluggable<IRepairPlugin, unknown>[]>(
      <RepairPluggables config={config} extras={repairInputs} />,
    );

    const sharedRepairs = this.create<IRepairPlugin[]>(
      <PluginBuilder<IRepairPlugin>
        plugins={this.map([repairPluggables, shareRemarks], ([current, shared]) =>
          shared && this.remarkPresets.matches() && isShareableRepairPluggables(current)
            ? current
            : [],
        )}
      />,
    );

    const remarkInputs = this.map([remarks, shareRemarks], ([current, shared]) =>
      shared ? current : [],
    );

    const sealed = this.createSharedRemarks(false, remarkInputs, sharedRepairs, shareRemarks);

    const ending = this.createSharedRemarks(true, remarkInputs, sharedRepairs, shareRemarks);

    const { shared: rehypes, shareable: shareRehypes } = this.createSharedRehypes();

    return this.map([shareRemarks, shareRehypes], ([canShareRemarks, canShareRehypes]) => ({
      sealed: canShareRemarks ? sealed : null,
      ending: canShareRemarks ? ending : null,
      rehypes: canShareRehypes ? rehypes : null,
    }));
  }

  private createSharedRemarks(
    repairEnding: boolean,
    extras: IReadableClosure<RemarkPluginSet>,
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

    const plugins = this.map([pluggables, shareable], ([current, shared]) =>
      shared && this.remarkPresets.matches() && isShareableRemarkPluggables(current) ? current : [],
    );

    return this.create<IRemarkPlugin[]>(<PluginBuilder<IRemarkPlugin> plugins={plugins} />);
  }

  private createSharedRehypes() {
    const { config, rehypes } = this.inputs;

    const sharedExtras = this.map([config, rehypes], ([currentConfig, current]) => {
      return this.rehypePresets.matches() && isShareableRehypeInputs(currentConfig, current)
        ? current
        : null;
    });

    const extras = this.map(sharedExtras, (current) => current ?? []);

    const pluggables = this.create<IPluggable<IRehypePlugin, unknown>[]>(
      <RehypePluggables config={config} extras={extras} />,
    );

    const sharedInputs = this.map([pluggables, sharedExtras], ([current, inputs]) => {
      return inputs !== null && this.rehypePresets.matches() && isShareableRehypePluggables(current)
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

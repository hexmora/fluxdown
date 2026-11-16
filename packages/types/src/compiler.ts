import type { IRawPatchItem } from './patch';
import type {
  IPluggable,
  IPluginWithConfig,
  IRehypePlugin,
  IRemarkPlugin,
  IRepairPlugin,
} from './plugins';

export interface CompilerConfig {
  repair: boolean;

  repairEnding: boolean;

  footnote: boolean;

  /**
   * Stable namespace for generated footnote IDs.
   */
  idPrefix?: string;

  tex: boolean;

  indentedCode: boolean;

  setextHeading: boolean;
}

export interface RemarkCompilerConfig extends CompilerConfig {
  patches: IRawPatchItem[];
}

export interface RemarkPluginEnabledContext {
  config: RemarkCompilerConfig;

  remarks: IPluggable<IRemarkPlugin, unknown>[];
}

export interface RepairPluginEnabledContext {
  config: CompilerConfig;

  remarks: IPluggable<IRemarkPlugin, unknown>[];

  repairs: IPluggable<IRepairPlugin, unknown>[];
}

export interface RemarkPluginConfigContext extends RemarkPluginEnabledContext {
  /**
   * Repair instances enabled for this block after resolving their constructor options.
   */
  repairs: IRepairPlugin[];
}

export type RepairPluginConfigContext = RepairPluginEnabledContext;

export interface RehypePluginContext {
  config: CompilerConfig;

  rehypes: IPluggable<IRehypePlugin, unknown>[];
}

export interface RenderPluginContext {
  config: CompilerConfig;

  renders: IPluggable<IPluginWithConfig, unknown>[];
}

export interface SlotPluginContext {
  plugins: IPluggable<IPluginWithConfig, unknown>[];
}

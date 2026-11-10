import type { IRawPatchItem } from './patch';
import type { IPluggable } from './plugins/base';
import type { IRemarkPlugin } from './plugins/remark';
import type { IRepairPlugin } from './plugins/repair';

export interface CompilerConfig {
  repair: boolean;

  repairEnding: boolean;

  footnote: boolean;

  /** Stable namespace for generated footnote IDs. */
  idPrefix?: string;

  tex: boolean;

  indentedCode: boolean;

  setextHeading: boolean;
}

export interface RemarkCompilerConfig extends CompilerConfig {
  patches: IRawPatchItem[];
}

export interface RemarkPluginContext {
  config: RemarkCompilerConfig;

  remarks: IPluggable<IRemarkPlugin, unknown>[];

  repairs: IRepairPlugin[];
}

export interface RepairPluginContext {
  config: CompilerConfig;

  remarks: IPluggable<IRemarkPlugin, unknown>[];

  repairs: IPluggable<IRepairPlugin, unknown>[];
}

import type { RepairPluginRunner } from '@fluxdown/types';

const structuralTail = /*#__PURE__*/ Symbol('structuralTail');

/** Mark runners whose effects are limited to the structural last-child chain. */
export const tailRepairRunner = (runner: RepairPluginRunner): RepairPluginRunner => {
  return Object.defineProperty(runner, structuralTail, { value: true });
};

export const isTailRepairRunner = (runner: RepairPluginRunner): boolean => {
  return structuralTail in runner;
};

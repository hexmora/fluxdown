import type { IPluggable, IRemarkPlugin } from '@fluxdown/types';

import { ApplyRepairsRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/apply-repairs';
import { PatchesRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/patches';
import { SyntaxFootnoteRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/syntax-footnote';
import { SyntaxMathRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/syntax-math';
import { SyntaxPolicyRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/syntax-policy';
import { PRESET_REMARK_PLUGINS } from '@fluxdown/core-plugins/presets/remark';
import { memoReturns } from 'stative';

import type { RemarkPluggablesInputs } from './type';

import { isPluggablesEqual, toPluggable } from '../../../base';
import { getPluggableClass, getPluggableConfig } from '../utils';

export * from './type';

export const RemarkPluggables = /*#__PURE__*/ memoReturns(function RemarkPluggables({
  config,
  extras,
  repairs,
}: RemarkPluggablesInputs): IPluggable<IRemarkPlugin, unknown>[] {
  const pluggables = toPluggable(extras, PRESET_REMARK_PLUGINS).filter((pluggable) => {
    const Plugin = getPluggableClass(pluggable);

    if (Plugin === SyntaxFootnoteRemarkPlugin) {
      return config.footnote;
    }

    if (Plugin === SyntaxMathRemarkPlugin) {
      return config.tex;
    }

    if (Plugin === ApplyRepairsRemarkPlugin) {
      return config.repair;
    }

    return true;
  });

  return pluggables.map((pluggable) => {
    const Plugin = getPluggableClass(pluggable);

    const pluginConfig = getPluggableConfig(pluggable);

    if (Plugin === SyntaxPolicyRemarkPlugin) {
      return [
        Plugin,
        {
          indentedCode: config.indentedCode,
          setextHeading: config.setextHeading,
          ...pluginConfig,
        },
      ];
    }

    if (Plugin === PatchesRemarkPlugin) {
      return [
        Plugin,
        {
          ...pluginConfig,
          patches: config.patches,
        },
      ];
    }

    if (Plugin === SyntaxMathRemarkPlugin) {
      return [
        Plugin,
        {
          ...pluginConfig,
          repairEnding: config.repair && config.repairEnding,
        },
      ];
    }

    if (Plugin === ApplyRepairsRemarkPlugin) {
      return [
        Plugin,
        {
          ...pluginConfig,
          plugins: repairs,
          ending: config.repairEnding,
        },
      ];
    }

    return pluggable;
  });
}, isPluggablesEqual);

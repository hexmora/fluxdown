/** @jsxImportSource stative */

import { once, useCombineMap, useMap, useSwitchMap } from 'stative';

import type { RehypeScopeInputs, RemarkScopeInputs } from './type';

// Cold scopes own private pipelines and release them when shared inputs become eligible again.
export const RemarkScope = /*#__PURE__*/ once(function RemarkScope({
  provider,
  config,
}: RemarkScopeInputs) {
  const selection = useCombineMap([config, provider], ([current, plugins]) => {
    if (
      !plugins.shareRemarks ||
      !provider.hasCurrentRemarkPresets() ||
      current.patches.length > 0
    ) {
      return null;
    }

    return current.repairEnding ? plugins.ending : plugins.sealed;
  });

  return useSwitchMap(selection, (shared) => shared ?? provider.createPrivateRemarks(config));
});

export const RehypeScope = /*#__PURE__*/ once(function RehypeScope({
  provider,
}: RehypeScopeInputs) {
  const selection = useMap(provider, (plugins) =>
    plugins.shareRehypes && provider.hasCurrentRehypePresets() ? plugins.rehypes : null,
  );

  return useSwitchMap(selection, (shared) => shared ?? provider.createPrivateRehypes());
});

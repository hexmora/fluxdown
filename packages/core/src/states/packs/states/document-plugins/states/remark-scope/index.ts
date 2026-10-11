import { once, useMap, useSwitchMap } from 'stative';

import type { RemarkScopeInputs } from './type';

// This cold scope releases its private pipeline when shared inputs become eligible again.
export const RemarkScope = /*#__PURE__*/ once(function RemarkScope({
  provider,
  config,
}: RemarkScopeInputs) {
  const selection = useMap([config, provider], ([current, plugins]) => {
    return plugins.sealed ? provider.getSharedRemarks(current, plugins) : null;
  });

  return useSwitchMap(selection, (shared) => shared ?? provider.createPrivateRemarks(config));
});

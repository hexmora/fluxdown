import { once, useMap, useSwitchMap } from 'stative';

import type { RehypeScopeInputs } from './type';

// This cold scope releases its private pipeline when shared inputs become eligible again.
export const RehypeScope = /*#__PURE__*/ once(function RehypeScope({
  provider,
}: RehypeScopeInputs) {
  const selection = useMap(provider, (plugins) =>
    plugins.rehypes ? provider.getSharedRehypes(plugins) : null,
  );

  return useSwitchMap(selection, (shared) => shared ?? provider.createPrivateRehypes());
});

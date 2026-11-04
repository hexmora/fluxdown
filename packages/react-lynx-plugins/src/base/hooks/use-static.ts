import { useMemo } from '@lynx-js/react';

export const useStatic = <T>(factory: () => T): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, []);
};

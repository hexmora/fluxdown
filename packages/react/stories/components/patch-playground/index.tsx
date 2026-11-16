import { useCallback, useMemo, useState } from 'react';

import { Playground } from '../playground';
import { Button } from '../ui';
import { PATCH_MARKDOWN } from './consts';
import { createPatches } from './utils';

export const PatchPlayground = () => {
  const [alternate, setAlternate] = useState(false);

  const renderReplacement = useCallback(
    (text?: string) => (
      <mark className="playground-patch-replacement">
        {alternate ? 'Updated replacement' : 'Replacement'}: {text}
      </mark>
    ),
    [alternate],
  );

  const patches = useMemo(() => createPatches(renderReplacement), [renderReplacement]);

  const actions = (
    <Button onClick={() => setAlternate((current) => !current)}>Replace render callback</Button>
  );

  return <Playground actions={actions} initialText={PATCH_MARKDOWN} patches={patches} />;
};

import { useEffect, useState } from 'react';

import type { CopyStatus } from './type';

export const useClipboard = (value: string) => {
  const [status, setStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    if (status === 'idle') {
      return;
    }

    const timer = window.setTimeout(() => setStatus('idle'), 2200);

    return () => window.clearTimeout(timer);
  }, [status]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  };

  return { status, copy };
};

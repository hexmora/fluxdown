/* oxlint-disable react/iframe-missing-sandbox -- Isolate the trusted, same-origin Lynx runtime. */
import { withBase } from '@rspress/core/runtime';
import { useEffect, useRef, useState } from 'react';

import type { LynxPreviewProps } from './type';

import styles from './index.module.scss';

export const LynxPreview = ({ data, errorLabel }: LynxPreviewProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const [ready, setReady] = useState(false);

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow
      ) {
        return;
      }

      if (event.data?.type === 'lynx-demo:ready') {
        setReady(true);
      }

      if (event.data?.type === 'lynx-demo:error') {
        setFailed(true);
      }
    };

    window.addEventListener('message', receive);

    return () => window.removeEventListener('message', receive);
  }, []);

  useEffect(() => {
    if (ready) {
      frameRef.current?.contentWindow?.postMessage(
        { type: 'lynx-demo:update', data },
        window.location.origin,
      );
    }
  }, [data, ready]);

  return (
    <>
      <iframe
        className={styles.frame}
        onLoad={() => setReady(true)}
        ref={frameRef}
        src={withBase('/lynx-demo/index.html')}
        title="Lynx"
      />
      {failed && <output>{errorLabel}</output>}
    </>
  );
};

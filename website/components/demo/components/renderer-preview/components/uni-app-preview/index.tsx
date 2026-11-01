/* oxlint-disable react/iframe-missing-sandbox -- The trusted same-origin frame runs the official uni-app H5 build. */
import { withBase } from '@rspress/core/runtime';
import { useEffect, useRef, useState } from 'react';

import type { UniAppPreviewProps } from './type';

import styles from './index.module.scss';

export const UniAppPreview = ({ data, errorLabel }: UniAppPreviewProps) => {
  const frame = useRef<HTMLIFrameElement>(null);

  const [ready, setReady] = useState(false);

  const [failed, setFailed] = useState(false);

  const [height, setHeight] = useState(24);

  const connect = () => {
    frame.current?.contentWindow?.postMessage(
      { type: 'uni-app-demo:connect' },
      window.location.origin,
    );
  };

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow
      ) {
        return;
      }

      if (event.data?.type === 'uni-app-demo:ready') {
        setFailed(false);

        setReady(true);
      }

      if (event.data?.type === 'uni-app-demo:resize') {
        setHeight(event.data.height);
      }

      if (event.data?.type === 'uni-app-demo:error') {
        setFailed(true);
      }
    };

    window.addEventListener('message', receive);

    connect();

    return () => window.removeEventListener('message', receive);
  }, []);

  useEffect(() => {
    if (ready) {
      frame.current?.contentWindow?.postMessage(
        { type: 'uni-app-demo:update', data },
        window.location.origin,
      );
    }
  }, [data, ready]);

  return (
    <>
      <iframe
        className={styles.frame}
        onError={() => setFailed(true)}
        onLoad={() => {
          setReady(false);

          connect();
        }}
        ref={frame}
        src={withBase('/uni-app-demo/index.html#/pages/website/index')}
        style={{ height }}
        title="uni-app"
      />
      {failed && <output>{errorLabel}</output>}
    </>
  );
};

import type { LynxViewElement } from '@lynx-js/web-core/client';

import '@lynx-js/web-core/client';

import type { LynxDemoData } from './type';

import './host.css';

let view: LynxViewElement | undefined;

window.addEventListener('message', (event: MessageEvent) => {
  if (
    event.origin !== window.location.origin ||
    event.source !== window.parent ||
    event.data?.type !== 'lynx-demo:update'
  ) {
    return;
  }

  const data = event.data.data as LynxDemoData;

  document.documentElement.style.colorScheme = data.dark ? 'dark' : 'light';

  if (view) {
    view.updateData(data);

    return;
  }

  view = document.createElement('lynx-view') as LynxViewElement;

  view.transformREM = false;

  view.setAttribute('height', 'auto');

  view.initData = data;

  view.addEventListener('error', () => {
    window.parent.postMessage({ type: 'lynx-demo:error' }, window.location.origin);
  });

  view.url = new URL('./main.web.bundle', window.location.href).href;

  document.body.append(view);
});

window.parent.postMessage({ type: 'lynx-demo:ready' }, window.location.origin);

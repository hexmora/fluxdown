import type { LynxViewElement } from '@lynx-js/web-core/client';

import '@lynx-js/web-core/client';

import type { BottomScrollMode } from '../components/bottom-scroll/utils';
import type { LynxDemoData } from './type';

import { createBottomScroll } from '../components/bottom-scroll/utils';
import './host.scss';

let view: LynxViewElement | undefined;
let reducedMotion: boolean | undefined;
let scrollMode: BottomScrollMode = 'static';
let stopFollowing: (() => void) | undefined;

const viewport = document.createElement('main');
viewport.className = 'viewport';
viewport.tabIndex = 0;
viewport.setAttribute('aria-label', 'Lynx');
const content = document.createElement('div');
content.className = 'content';
viewport.append(content);
document.body.append(viewport);

window.addEventListener('message', (event: MessageEvent) => {
  if (event.origin !== window.location.origin || event.source !== window.parent) {
    return;
  }

  if (event.data?.type === 'lynx-demo:connect') {
    window.parent.postMessage({ type: 'lynx-demo:ready' }, window.location.origin);
    return;
  }

  if (event.data?.type !== 'lynx-demo:update') {
    return;
  }

  const data = event.data.data as LynxDemoData;

  scrollMode = data.scrollMode;

  document.documentElement.style.colorScheme = data.dark ? 'dark' : 'light';

  if (reducedMotion !== data.reducedMotion) {
    stopFollowing?.();
    reducedMotion = data.reducedMotion;
    stopFollowing = createBottomScroll(viewport, content, reducedMotion, () => scrollMode);
  }

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

  content.append(view);
});

window.parent.postMessage({ type: 'lynx-demo:ready' }, window.location.origin);

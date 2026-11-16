import { XMarkdown } from '@ant-design/x-markdown';
import {
  CodeHeaderSlotPlugin,
  CodeHighlighterSlotPlugin,
} from '@fluxdown/react-plugins/plugins/code';
import { Fluxdown } from 'fluxdown';
import MarkdownIt from 'markdown-it';
import taskLists from 'markdown-it-task-lists';
import { marked } from 'marked';
import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Streamdown } from 'streamdown';

const plugins = {
  slots: [
    [CodeHeaderSlotPlugin, { disabled: true }],
    [CodeHighlighterSlotPlugin, { disabled: true }],
  ],
};
const markdown = new MarkdownIt({ html: false, linkify: true }).use(taskLists);
const remarks = [remarkGfm];
const react = {
  fluxdown: (text, done) => (
    <Fluxdown
      text={text}
      build={{ tex: false, footnote: false, indentedCode: true, setextHeading: true }}
      plugins={plugins}
      streaming={done ? false : { smooth: false, effect: false }}
    />
  ),
  streamdown: (text, done) => (
    <Streamdown
      mode={done ? 'static' : 'streaming'}
      isAnimating={!done}
      parseIncompleteMarkdown={!done}
      animated={false}
      controls={false}
      lineNumbers={false}
      linkSafety={{ enabled: false }}
    >
      {text}
    </Streamdown>
  ),
  xmarkdown: (text, done) => (
    <XMarkdown
      content={text}
      streaming={{
        hasNextChunk: !done,
        incompleteMarkdown: 'complete',
        typewriter: false,
        enableAnimation: false,
      }}
    />
  ),
  reactmarkdown: (text) => <ReactMarkdown remarkPlugins={remarks}>{text}</ReactMarkdown>,
};
export const staticOracle = (text) => {
  return renderToStaticMarkup(<ReactMarkdown remarkPlugins={remarks}>{text}</ReactMarkdown>);
};
export const create = (name) => {
  const container = document.createElement('main');
  document.body.append(container);
  const root = react[name] ? createRoot(container) : null;
  return {
    container,
    update(text, done) {
      if (root) flushSync(() => root.render(react[name](text, done)));
      else
        container.innerHTML =
          name === 'marked'
            ? marked.parse(text, { gfm: true, async: false })
            : markdown.render(text);
    },
    destroy() {
      if (root) flushSync(() => root.unmount());
      container.remove();
    },
  };
};
export { flushSync };

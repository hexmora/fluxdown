import type { ThemeRegistration } from 'shiki/core';

import { createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import bash from 'shiki/langs/bash.mjs';
import css from 'shiki/langs/css.mjs';
import html from 'shiki/langs/html.mjs';
import javascript from 'shiki/langs/javascript.mjs';
import json from 'shiki/langs/json.mjs';
import python from 'shiki/langs/python.mjs';
import typescript from 'shiki/langs/typescript.mjs';

import type { ThemeTokens } from '../../../../../base/theme';

export const createCodeHighlighter = () =>
  createHighlighterCoreSync({
    langs: [bash, css, html, javascript, json, python, typescript],

    themes: [],

    engine: createJavaScriptRegexEngine({ target: 'ES2018', forgiving: true }),
  });

export const createCodeTheme = ({ colors, syntax }: ThemeTokens): ThemeRegistration => ({
  name: 'fluxdown',
  colors: { 'editor.foreground': colors.fg, 'editor.background': colors.surfaceSubtle },
  tokenColors: [
    { scope: ['comment'], settings: { foreground: syntax.comment } },
    { scope: ['keyword', 'storage'], settings: { foreground: syntax.keyword } },
    { scope: ['string'], settings: { foreground: syntax.string } },
    { scope: ['constant.numeric'], settings: { foreground: syntax.number } },
    {
      scope: ['entity.name.function', 'support.function'],
      settings: { foreground: syntax.function },
    },
    { scope: ['variable', 'entity.name.tag'], settings: { foreground: syntax.variable } },
    { scope: ['punctuation'], settings: { foreground: syntax.punctuation } },
    { scope: ['markup.inserted'], settings: { foreground: syntax.inserted } },
    { scope: ['markup.deleted'], settings: { foreground: syntax.deleted } },
  ],
});

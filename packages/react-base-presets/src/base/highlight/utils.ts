import type { HighlighterCore, ThemeRegistrationRaw } from 'shiki/core';

import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { bundledLanguages } from 'shiki/langs';

let highlighterPromise: Promise<HighlighterCore> | undefined;

const languages = new Map<string, Promise<void>>();

const getHighlighter = () => {
  highlighterPromise ??= createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [],
    themes: [],
  }).catch((error: unknown) => {
    highlighterPromise = undefined;

    throw error;
  });

  return highlighterPromise;
};

export const highlightCode = async (
  code: string,
  language: string,
  theme: ThemeRegistrationRaw,
  signal?: AbortSignal,
) => {
  const normalizedLanguage = language.trim().toLowerCase();

  if (signal?.aborted || !Object.hasOwn(bundledLanguages, normalizedLanguage)) {
    return null;
  }

  const highlighter = await getHighlighter();

  const loadLanguage = bundledLanguages[normalizedLanguage as keyof typeof bundledLanguages];

  if (!languages.has(normalizedLanguage)) {
    languages.set(
      normalizedLanguage,
      highlighter.loadLanguage(loadLanguage).catch((error: unknown) => {
        languages.delete(normalizedLanguage);

        throw error;
      }),
    );
  }

  await languages.get(normalizedLanguage);

  if (signal?.aborted) {
    return null;
  }

  return highlighter.codeToTokens(code, {
    lang: normalizedLanguage,
    theme,
  }).tokens;
};

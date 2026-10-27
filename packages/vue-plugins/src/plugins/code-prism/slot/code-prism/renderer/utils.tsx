import type { hooks, TokenStream } from 'prismjs';
import type { VNodeChild } from 'vue';

import { castArray, has, isObjectLike, isString, noop, toLower, trim } from 'lodash-es';
import Prism from 'prismjs';

// Vue owns the code DOM; Prism only supplies token trees.
Prism.manual = true;

let languagesPromise: Promise<void> | undefined;

const loadLanguages = () => {
  languagesPromise ??= import('./languages').then(noop).catch((error: unknown) => {
    languagesPromise = undefined;

    throw error;
  });

  return languagesPromise;
};

const getGrammar = (language: string) => {
  const grammar = has(Prism.languages, [language]) ? Prism.languages[language] : undefined;

  return isObjectLike(grammar) ? grammar : null;
};

const renderTokens = (tokens: TokenStream): VNodeChild => {
  if (isString(tokens)) {
    return tokens;
  }

  const items = castArray(tokens);

  let offset = 0;

  return items.map((token) => {
    const key = offset;

    offset += token.length;

    if (isString(token)) {
      return token;
    }

    return (
      <span class={['token', token.type, ...castArray(token.alias ?? [])].join(' ')} key={key}>
        {renderTokens(token.content)}
      </span>
    );
  });
};

export const highlightCode = async (
  code: string,
  language: string,
  signal?: AbortSignal,
): Promise<VNodeChild> => {
  if (signal?.aborted) {
    return null;
  }

  const name = toLower(trim(language));

  if (!name || getGrammar(name) === Prism.languages.plaintext) {
    return null;
  }

  // Extras also extend built-in grammars such as JavaScript and CSS. Initialize
  // the complete configuration before tokenizing so block order cannot affect it.
  await loadLanguages();

  const grammar = getGrammar(name);

  if (signal?.aborted || !grammar) {
    return null;
  }

  // Match Prism.highlight's tokenizer lifecycle for JSX and embedded templates,
  // while keeping Vue in charge of escaping and rendering the source.
  const environment: hooks.TokenizeEnvironment = { code, grammar, language: name };

  Prism.hooks.run('before-tokenize', environment);

  environment.tokens = Prism.tokenize(environment.code, environment.grammar);

  Prism.hooks.run('after-tokenize', environment);

  return renderTokens(environment.tokens);
};

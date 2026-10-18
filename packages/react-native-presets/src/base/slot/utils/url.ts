/**
 * Native links require an absolute, explicitly allowed scheme.
 */
export const normalizePublicUrl = (
  value: string | undefined,
  { allowMailto = false, allowTel = false } = {},
): string | undefined => {
  const source = value?.trim();

  if (
    !source ||
    Array.from(source).some(
      (character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    )
  ) {
    return undefined;
  }

  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(source)?.[1]?.toLowerCase();

  if (
    scheme !== 'http' &&
    scheme !== 'https' &&
    !(allowMailto && scheme === 'mailto') &&
    !(allowTel && scheme === 'tel')
  ) {
    return undefined;
  }

  if (
    (scheme === 'http' || scheme === 'https') &&
    !/^https?:\/\/[^/\s?#]+(?:[/?#]|$)/i.test(source)
  ) {
    return undefined;
  }

  return source;
};

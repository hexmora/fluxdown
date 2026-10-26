export const normalizePublicUrl = (
  value: string | undefined,
  { allowHash = false, allowMailto = false } = {},
): string | undefined => {
  const source = value?.trim();

  if (
    !source ||
    [...source].some(
      (character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127,
    )
  ) {
    return undefined;
  }

  if (source.startsWith('#')) {
    return allowHash ? source : undefined;
  }

  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(source)?.[1]?.toLowerCase();

  if (!scheme) {
    return source;
  }

  if (allowMailto && scheme === 'mailto') {
    return source.slice(7) ? source : undefined;
  }

  return (scheme === 'https' || scheme === 'http') && /^https?:\/\/[^/\s]+/i.test(source)
    ? source
    : undefined;
};

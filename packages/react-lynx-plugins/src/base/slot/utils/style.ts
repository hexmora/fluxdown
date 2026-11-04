export const joinClassNames = (...names: (string | undefined | false)[]): string =>
  names.filter(Boolean).join(' ');

// Native hosts may expose frame callbacks without the browser Performance API.
export const getTime = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();

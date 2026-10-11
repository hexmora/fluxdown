export const hookOrderError = () => {
  return new TypeError('State closure hooks must be called in the same order on every render.');
};

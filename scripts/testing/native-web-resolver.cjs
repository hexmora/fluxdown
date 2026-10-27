// Jest executes dynamic imports as CommonJS. Select public ESM exports for
// the diagram engine without changing conditions for Jest's own dependencies.
module.exports = (request, options) =>
  options.defaultResolver(request, {
    ...options,
    ...(request === '@osuki-dev/skia-diagrams' || request === '@mermaid-js/parser'
      ? { conditions: ['import', ...(options.conditions ?? [])] }
      : {}),
  });

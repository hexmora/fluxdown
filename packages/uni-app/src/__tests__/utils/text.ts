export const getText = (element: Element) => {
  const nodes = element.matches('text') ? [element] : Array.from(element.querySelectorAll('text'));

  return nodes
    .filter((node) => !node.closest('[aria-hidden="true"]'))
    .map((node) => node.textContent ?? '')
    .join('')
    .replaceAll('\u00a0', ' ')
    .replaceAll('\u200b', '');
};

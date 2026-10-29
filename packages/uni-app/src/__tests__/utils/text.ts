export const getText = (element: Element) => {
  return Array.from(element.querySelectorAll('text'))
    .filter((node) => !node.closest('[aria-hidden="true"]'))
    .map((node) => node.textContent ?? '')
    .join('')
    .replaceAll('\u00a0', ' ')
    .replaceAll('\u200b', '');
};

export const getSvg = (html: string | null) => {
  const xml = html?.match(/<svg\b[\s\S]*<\/svg>/)?.[0];

  if (!xml) {
    return null;
  }

  const width = Number(xml.match(/\bwidth="([\d.]+)ex"/)?.[1]) * 8;

  const height = Number(xml.match(/\bheight="([\d.]+)ex"/)?.[1]) * 8;

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  // MathJax metadata is not needed to draw the SVG. Removing it also avoids
  // react-native-svg camel-casing data-* attributes into unknown React DOM props.
  const drawing = xml.replace(/\sdata-[\w-]+=(?:"[^"]*"|'[^']*')/g, '');

  return { xml: drawing, width, height };
};

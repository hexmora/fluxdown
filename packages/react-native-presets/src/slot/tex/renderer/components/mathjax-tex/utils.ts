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

  return { xml, width, height };
};

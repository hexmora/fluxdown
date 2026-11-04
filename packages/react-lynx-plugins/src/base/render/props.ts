import type { Element } from 'hast';

/** Only presentation data crosses the HAST/native-element boundary. */
export const getLynxProps = (node?: Element): Record<string, unknown> => {
  const properties = node?.properties;

  if (!properties) {
    return {};
  }

  const props: Record<string, unknown> = {};

  if (typeof properties.id === 'string') {
    props.id = properties.id;
  }

  const className = properties.className;

  if (Array.isArray(className)) {
    props.className = className.join(' ');
  } else if (typeof className === 'string') {
    props.className = className;
  }

  for (const key of ['width', 'height', 'start'] as const) {
    const value = properties[key];

    if (typeof value === 'number' || typeof value === 'string') {
      props[key] = value;
    }
  }

  if (typeof properties.checked === 'boolean') {
    props.checked = properties.checked;
  }

  for (const [key, value] of Object.entries(properties)) {
    if (!/^data(?:[A-Z]|-)/.test(key) || !['string', 'number', 'boolean'].includes(typeof value)) {
      continue;
    }

    const name = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

    props[name] = value;
  }

  return props;
};

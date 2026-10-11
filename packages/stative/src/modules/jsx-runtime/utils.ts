import { markStateClosureDescriptor } from '../state-closure/exports/render/utils/consts';
import { Fragment } from './main';

export type RuntimeProps = Readonly<Record<string, unknown>>;

export type FragmentProps = { readonly children?: unknown };

export const createDescriptorElement = (
  Factory: unknown,
  props: RuntimeProps | FragmentProps,
  key?: unknown,
): unknown => {
  if (Factory === Fragment) {
    throw new TypeError('Descriptor JSX fragments are not supported.');
  }

  const descriptorProps =
    key === undefined || Object.prototype.hasOwnProperty.call(props, 'key')
      ? props
      : { ...props, key };

  return markStateClosureDescriptor([Factory, descriptorProps]);
};

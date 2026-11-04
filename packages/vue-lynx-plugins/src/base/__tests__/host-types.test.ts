import { expectTypeOf, test } from 'vitest';

import type {
  CodeBlockHandleCopyFunction,
  CodeBlockProps,
  CodeHeaderProps,
  LinkProps,
  RuntimeSlotProps,
  SlotBaseAttributes,
  Slots,
  TableProps,
} from '..';
import type {
  SlotBaseAttributes as WebAttributes,
  LinkProps as WebLinkProps,
  TableProps as WebTableProps,
} from '../../../../vue-plugins/src/base';

test('keeps DOM and native host contracts separate in the same TypeScript program', () => {
  expectTypeOf<WebAttributes>().toHaveProperty('style');

  expectTypeOf<SlotBaseAttributes>().toHaveProperty('style');

  expectTypeOf<WebLinkProps>().toHaveProperty('onClick');

  expectTypeOf<LinkProps>().toHaveProperty('onTap');

  expectTypeOf<WebLinkProps>().not.toHaveProperty('onTap');

  expectTypeOf<LinkProps>().not.toHaveProperty('onClick');

  expectTypeOf<TableProps>().toHaveProperty('columns');

  expectTypeOf<WebTableProps>().not.toHaveProperty('columns');

  expectTypeOf<RuntimeSlotProps['style']>().toEqualTypeOf<SlotBaseAttributes['style']>();

  expectTypeOf<Slots['Link']>().not.toBeNullable();

  const web: WebAttributes = { style: [{ color: 'red' }, { opacity: 0.5 }] };

  const native: SlotBaseAttributes = { style: { linearOrientation: 'vertical' } };

  // @ts-expect-error Native CSS does not accept Vue DOM style arrays.
  const invalidNative: SlotBaseAttributes = { style: [{ color: 'red' }] };

  // @ts-expect-error DOM CSS does not contain native linear layout properties.
  const invalidWeb: WebAttributes = { style: { linearOrientation: 'vertical' } };

  expectTypeOf(web).toMatchTypeOf<WebAttributes>();

  expectTypeOf(native).toMatchTypeOf<SlotBaseAttributes>();

  expectTypeOf(invalidNative).toMatchTypeOf<SlotBaseAttributes>();

  expectTypeOf(invalidWeb).toMatchTypeOf<WebAttributes>();
});

test('preserves asynchronous native copy callbacks on both code slots', () => {
  expectTypeOf<ReturnType<CodeBlockHandleCopyFunction>>().toEqualTypeOf<void | Promise<void>>();

  expectTypeOf<
    ReturnType<NonNullable<CodeBlockProps['onCopy']>>
  >().toEqualTypeOf<void | Promise<void>>();

  expectTypeOf<
    ReturnType<NonNullable<CodeHeaderProps['onCopy']>>
  >().toEqualTypeOf<void | Promise<void>>();
});

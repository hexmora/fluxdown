import { BaseSlotPlugin as SharedBaseSlotPlugin } from '@fluxdown/react-base-presets/base';
import { render, screen } from '@testing-library/react';
import { expectTypeOf } from 'expect-type';

import type { AnySlotPlugin, ISlotPlugin, SlotBaseProps } from '../..';

import { BaseSlotPlugin, createTypeOfSlot, SlotProvider } from '../..';

test('preserves DOM styles on generic public slot contracts', () => {
  const props: SlotBaseProps = { Raw: null, className: 'custom', style: { color: 'red' } };

  expect(props.className).toBe('custom');

  class ParagraphPlugin extends BaseSlotPlugin<'Paragraph'> {
    static readonly key = 'test-dom-slot-contract';

    readonly type = 'Paragraph';

    readonly Component: NonNullable<ISlotPlugin<'Paragraph'>['Component']> = ({
      children,
      className,
      style,
    }) => (
      <p className={className} style={style}>
        {children}
      </p>
    );
  }

  expectTypeOf<ParagraphPlugin>().toMatchTypeOf<AnySlotPlugin>();

  const Paragraph = createTypeOfSlot('Paragraph');

  render(
    <SlotProvider plugins={[ParagraphPlugin]}>
      <Paragraph
        className={props.className}
        current={{ type: 'element', tagName: 'p', properties: {}, children: [] }}
        parents={[]}
        render={() => null}
        style={props.style}
      >
        styled contract
      </Paragraph>
    </SlotProvider>,
  );

  expect(screen.getByText('styled contract')).toHaveClass('custom');

  expect(screen.getByText('styled contract')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
});

test('retains the shared slot constructor identity across platform exports', () => {
  expect(BaseSlotPlugin).toBe(SharedBaseSlotPlugin);
});

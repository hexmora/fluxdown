import type { PropsWithChildren } from '@lynx-js/react';

import { Component } from '@lynx-js/react';

import type { RuntimeSlotInputComponent, SlotInputProps, SlotType } from '../../type';

type SlotErrorBoundaryProps = PropsWithChildren<{
  Component: RuntimeSlotInputComponent | null;

  props: SlotInputProps;

  renderer: RuntimeSlotInputComponent;

  type: SlotType;
}>;

export class SlotErrorBoundary extends Component<
  SlotErrorBoundaryProps,
  { error: unknown; failed: boolean }
> {
  state = { error: null as unknown, failed: false };

  static getDerivedStateFromError(error: unknown) {
    return { error, failed: true };
  }

  componentDidUpdate(previous: SlotErrorBoundaryProps) {
    if (
      this.state.failed &&
      (previous.props !== this.props.props ||
        previous.Component !== this.props.Component ||
        previous.renderer !== this.props.renderer)
    ) {
      this.reset();
    }
  }

  private readonly reset = () => this.setState({ error: null, failed: false });

  render() {
    const { children, Component: Fallback, props, type } = this.props;

    const { error, failed } = this.state;

    if (!failed) {
      return children;
    }

    return Fallback ? (
      <Fallback error={error} onReset={this.reset} props={props} type={type} />
    ) : null;
  }
}

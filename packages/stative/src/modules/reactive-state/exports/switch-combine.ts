import { type Observer, UnsubscriptionError } from 'rxjs';
import { shallowEqual } from 'shallow-equal';

import type { Distinctor, IReactiveState, StateMapper, StateValues } from '../type';

import { getStateNode } from '../../state-graph/node';
import { observeState, type StateSubscription } from '../observe';
import { ReactiveState } from './base';
import { toState } from './operator';
import { isStateSourceLike } from './utils';

type Input = {
  source: unknown;
  state: IReactiveState<unknown> | null;
  completed: boolean;
  active: boolean;
  subscription?: StateSubscription;
};

type CombinedValues<TSources extends readonly unknown[], TSelected extends readonly unknown[]> = [
  StateValues<TSources>,
  StateValues<TSelected>,
];

class SwitchCombinedState<
  TSources extends [unknown, ...unknown[]],
  TSelected extends readonly unknown[],
  R,
> extends ReactiveState<R> {
  private fixed: Input[];

  private selected: Input[];

  private fixedValues: StateValues<TSources> | null;

  private previous: [CombinedValues<TSources, TSelected>, R] | null;

  private selector: ((values: StateValues<TSources>) => TSelected) | null;

  private mapper: StateMapper<CombinedValues<TSources, TSelected>, R> | null;

  private observer: Observer<R> | null = null;

  private done = false;

  private inputFailed = false;

  private inputError: unknown;

  private refreshCallback?: () => void;

  constructor(
    sources: TSources,
    selector: (values: StateValues<TSources>) => TSelected,
    mapper: StateMapper<CombinedValues<TSources, TSelected>, R>,
    distinctor?: Distinctor<R>,
  ) {
    const fixed = sources.map(SwitchCombinedState.createInput);
    const fixedValues = fixed.map(SwitchCombinedState.readInput) as StateValues<TSources>;
    const selected = selector(fixedValues).map(SwitchCombinedState.createInput);
    const selectedValues = selected.map(SwitchCombinedState.readInput) as StateValues<TSelected>;
    const values: CombinedValues<TSources, TSelected> = [fixedValues, selectedValues];
    const initial = mapper(values, null);

    super({ initial, distinctor, emitter: (observer) => this.start(observer) });

    this.fixed = fixed;

    this.selected = selected;

    this.fixedValues = fixedValues;

    this.previous = [values, initial];

    this.selector = selector;

    this.mapper = mapper;
  }

  private static createInput(source: unknown): Input {
    const state = isStateSourceLike(source) ? toState(source) : null;

    return { source, state, completed: state === null, active: false };
  }

  private static readInput(input: Input): unknown {
    return input.state ? input.state.value : input.source;
  }

  private schedule() {
    if (!this.done) {
      this.refreshCallback ??= this.refresh.bind(this);

      getStateNode(this).schedule(this.refreshCallback);
    }
  }

  private connect(input: Input) {
    if (this.done || !input.state || input.subscription) {
      return;
    }

    input.active = true;

    const subscription = observeState(input.state, {
      next: () => {
        if (input.active) {
          this.schedule();
        }
      },
      error: (error) => {
        if (input.active && !this.done && !this.inputFailed) {
          this.inputFailed = true;

          this.inputError = error;

          this.schedule();
        }
      },
      complete: () => {
        if (!input.active) {
          return;
        }

        input.completed = true;

        this.schedule();
      },
    });

    if (this.done) {
      input.active = false;

      subscription.unsubscribe();
    } else {
      input.subscription = subscription;
    }
  }

  private disconnect(inputs: Input[]) {
    let errors: unknown[] | undefined;

    for (const input of inputs) {
      input.active = false;

      const subscription = input.subscription;

      input.subscription = undefined;

      try {
        subscription?.unsubscribe();
      } catch (error) {
        errors ??= [];

        errors.push(...(error instanceof UnsubscriptionError ? error.errors : [error]));
      }
    }

    if (errors) {
      throw new UnsubscriptionError(errors);
    }
  }

  private replace(nextSources: TSelected) {
    const remaining = [...this.selected];
    const next = nextSources.map((source) => {
      const index = remaining.findIndex((input) => Object.is(input.source, source));

      return index >= 0 ? remaining.splice(index, 1)[0] : SwitchCombinedState.createInput(source);
    });

    if (this.done) {
      return;
    }

    // Detach before the mapper can release the old selection's owner.
    this.disconnect(remaining);

    if (this.done) {
      return;
    }

    this.selected = next;

    for (const input of this.selected) {
      this.connect(input);
    }
  }

  private refresh() {
    if (this.done) {
      return;
    }

    const observer = this.observer!;
    const selector = this.selector!;
    const mapper = this.mapper!;

    try {
      if (!this.inputFailed) {
        const fixedValues = this.fixed.map(SwitchCombinedState.readInput) as StateValues<TSources>;

        if (this.done) {
          return;
        }

        if (!shallowEqual(fixedValues, this.fixedValues!)) {
          this.fixedValues = fixedValues;

          const selected = selector(fixedValues);

          if (this.done) {
            return;
          }

          this.replace(selected);
        }

        if (this.done) {
          return;
        }

        const selectedValues = this.selected.map(
          SwitchCombinedState.readInput,
        ) as StateValues<TSelected>;

        if (this.done) {
          return;
        }

        if (
          !this.inputFailed &&
          (!shallowEqual(this.fixedValues!, this.previous![0][0]) ||
            !shallowEqual(selectedValues, this.previous![0][1]))
        ) {
          const values: CombinedValues<TSources, TSelected> = [this.fixedValues!, selectedValues];
          const value = mapper(values, this.previous);

          if (this.done) {
            return;
          }

          this.previous = [values, value];

          observer.next(value);
        }
      }

      if (this.done) {
        return;
      }

      if (this.inputFailed) {
        this.done = true;

        observer.error(this.inputError);
      } else if (
        this.fixed.every((input) => input.completed) &&
        this.selected.every((input) => input.completed)
      ) {
        this.done = true;

        observer.complete();
      }
    } catch (error) {
      this.done = true;

      observer.error(error);
    }
  }

  private start(observer: Observer<R>) {
    this.observer = observer;

    try {
      for (const input of this.fixed) {
        this.connect(input);
      }

      for (const input of this.selected) {
        this.connect(input);
      }
    } catch (error) {
      this.inputFailed = true;

      this.inputError = error;
    }

    this.schedule();

    return () => this.cleanup();
  }

  private cleanup() {
    this.done = true;

    const fixed = this.fixed;
    const selected = this.selected;

    this.fixed = [];

    this.selected = [];

    this.fixedValues = null;

    this.previous = null;

    this.selector = null;

    this.mapper = null;

    this.observer = null;

    this.inputError = undefined;

    this.refreshCallback = undefined;

    let errors: unknown[] | undefined;

    // Both groups disconnect even when a borrowed source teardown throws.
    try {
      this.disconnect(fixed);
    } catch (error) {
      errors = (error as UnsubscriptionError).errors;
    }

    try {
      this.disconnect(selected);
    } catch (error) {
      errors = [...(errors ?? []), ...(error as UnsubscriptionError).errors];
    }

    if (errors) {
      throw new UnsubscriptionError(errors);
    }
  }

  override destroy() {
    try {
      super.destroy();
    } finally {
      this.cleanup();
    }
  }
}

/**
 * Select dynamic inputs when fixed values change, then project both in one scheduled state.
 * The mapper has the same previous-value contract as combineMapState. Inputs are borrowed;
 * completion waits for every fixed input and the current selection to finish.
 */
export const switchCombineMapState = <
  const TSources extends [unknown, ...unknown[]],
  const TSelected extends readonly unknown[],
  R,
>(
  sources: [...TSources],
  selector: (values: StateValues<TSources>) => TSelected,
  mapper: StateMapper<CombinedValues<TSources, TSelected>, R>,
  distinctor?: Distinctor<R>,
): ReactiveState<R> => new SwitchCombinedState(sources, selector, mapper, distinctor);

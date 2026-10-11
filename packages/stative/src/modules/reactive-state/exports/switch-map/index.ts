import type { Observer } from 'rxjs';

import { isArray } from 'lodash-es';
import { UnsubscriptionError } from 'rxjs';

import type { Distinctor, StateInputValue, StateMapper, StateValues } from '../../type';
import type { Input } from './utils';

import { observeState, StateNode } from '../../../__internal__';
import { ReactiveState } from '../../main';
import { createInput, isInputValuesEqual, readInputValues, toSources } from './utils';

type MappedValues<S, T> = [StateInputValue<S>, StateInputValue<T>];

class SwitchMappedState<S, T, R> extends ReactiveState<R> {
  private fixed: Input[];

  private selected: Input[];

  private fixedValues: StateInputValue<S> | null;

  private readonly multiple: boolean;

  private selectedMultiple: boolean;

  private previous: [MappedValues<S, T>, R] | null;

  private selector: ((values: StateInputValue<S>) => T) | null;

  private mapper: StateMapper<MappedValues<S, T>, R> | null;

  private observer: Observer<R> | null = null;

  private done = false;

  private inputFailed = false;

  private inputError: unknown;

  private refreshCallback?: () => void;

  constructor(
    source: S,
    selector: (values: StateInputValue<S>) => T,
    mapper: StateMapper<MappedValues<S, T>, R>,
    distinctor?: Distinctor<R>,
  ) {
    const multiple = isArray(source);
    const fixed = toSources(source).map(createInput);
    const fixedValues = readInputValues<S>(fixed, multiple);
    const selection = selector(fixedValues);
    const selectedMultiple = isArray(selection);
    const selected = toSources(selection).map(createInput);
    const selectedValues = readInputValues<T>(selected, selectedMultiple);
    const values: MappedValues<S, T> = [fixedValues, selectedValues];
    const initial = mapper(values, null);

    super({ initial, distinctor, emitter: (observer) => this.start(observer) });

    this.fixed = fixed;

    this.multiple = multiple;

    this.selectedMultiple = selectedMultiple;

    this.selected = selected;

    this.fixedValues = fixedValues;

    this.previous = [values, initial];

    this.selector = selector;

    this.mapper = mapper;
  }

  private schedule() {
    if (!this.done) {
      this.refreshCallback ??= this.refresh.bind(this);

      StateNode.get(this).schedule(this.refreshCallback);
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

  private replace(source: T) {
    const remaining = [...this.selected];
    const next = toSources(source).map((source) => {
      const index = remaining.findIndex((input) => Object.is(input.source, source));

      return index >= 0 ? remaining.splice(index, 1)[0] : createInput(source);
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

    this.selectedMultiple = isArray(source);

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
        const fixedValues = readInputValues<S>(this.fixed, this.multiple);

        if (this.done) {
          return;
        }

        if (!isInputValuesEqual(fixedValues, this.fixedValues, this.multiple)) {
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

        const selectedValues = readInputValues<T>(this.selected, this.selectedMultiple);

        if (this.done) {
          return;
        }

        const [[previousFixed, previousSelected]] = this.previous!;

        if (
          !this.inputFailed &&
          (!isInputValuesEqual(this.fixedValues, previousFixed, this.multiple) ||
            !isInputValuesEqual(selectedValues, previousSelected, this.selectedMultiple))
        ) {
          const values: MappedValues<S, T> = [this.fixedValues!, selectedValues];
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
 * Sources and selections accept either a single source or a list of sources.
 * The mapper has the same previous-value contract as mapState. Inputs are borrowed;
 * completion waits for every fixed input and the current selection to finish.
 */
export function switchMapState<const S extends readonly unknown[], const T, R>(
  sources: readonly [...S],
  selector: (values: StateValues<[...S]>) => T,
  mapper: StateMapper<MappedValues<readonly [...S], T>, R>,
  distinctor?: Distinctor<R>,
): ReactiveState<R>;
export function switchMapState<S, const T, R>(
  source: S,
  selector: (value: StateInputValue<S>) => T,
  mapper: StateMapper<MappedValues<S, T>, R>,
  distinctor?: Distinctor<R>,
): ReactiveState<R>;
export function switchMapState<S, T, R>(
  source: S,
  selector: (value: StateInputValue<S>) => T,
  mapper: StateMapper<MappedValues<S, T>, R>,
  distinctor?: Distinctor<R>,
): ReactiveState<R> {
  return new SwitchMappedState(source, selector, mapper, distinctor);
}

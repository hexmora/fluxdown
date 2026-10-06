type StateObserver = {
  closed: boolean;

  next: StateObserver | null;
};

export const countStateObservers = (state: unknown): number => {
  const { observers } = state as { observers: { first: StateObserver | null } | null };

  let current = observers?.first;

  let count = 0;

  while (current) {
    if (!current.closed) {
      count += 1;
    }

    current = current.next;
  }

  return count;
};

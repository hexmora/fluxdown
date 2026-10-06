type Dependency = {
  normal: number;
  ordering: number;
};

/** Track ordering prerequisites without spreading value invalidation through them. */
export class StateLinks<T> {
  readonly sources = new Map<StateLinks<T>, Dependency>();

  readonly targets = new Map<StateLinks<T>, Dependency>();

  private roots: Set<StateLinks<T>> | null = null;

  constructor(readonly node: T) {}

  get barriers(): ReadonlySet<StateLinks<T>> | null {
    return this.roots;
  }

  private addBarrier(root: StateLinks<T>) {
    const pending: StateLinks<T>[] = [this];

    for (let index = 0; index < pending.length; index++) {
      const links = pending[index];

      if (links.roots?.has(root)) {
        continue;
      }

      links.roots ??= new Set();

      links.roots.add(root);

      for (const target of links.targets.keys()) {
        pending.push(target);
      }
    }
  }

  connect(source: StateLinks<T>, ordering: boolean) {
    let dependency = this.sources.get(source);

    const connected = dependency !== undefined;

    if (!dependency) {
      dependency = { normal: 0, ordering: 0 };

      this.sources.set(source, dependency);

      source.targets.set(this, dependency);
    }

    if (ordering) {
      dependency.ordering += 1;

      if (dependency.ordering === 1) {
        this.addBarrier(source);
      }
    } else {
      dependency.normal += 1;
    }

    const { roots } = source;

    if (!connected && roots) {
      for (const root of roots) {
        this.addBarrier(root);
      }
    }
  }

  disconnect(source: StateLinks<T>, ordering: boolean) {
    const dependency = this.sources.get(source);

    if (!dependency) {
      return;
    }

    if (ordering) {
      dependency.ordering -= 1;
    } else {
      dependency.normal -= 1;
    }

    if (dependency.normal === 0 && dependency.ordering === 0) {
      this.sources.delete(source);

      source.targets.delete(this);

      if (!ordering && !source.roots) {
        return;
      }
    } else if (!ordering || dependency.ordering > 0) {
      return;
    }

    if (this.roots) {
      this.rebuild([this]);
    }
  }

  private rebuild(initial: StateLinks<T>[]) {
    const affected = new Set(initial);

    for (const links of affected) {
      for (const target of links.targets.keys()) {
        affected.add(target);
      }
    }

    // Clear the whole affected region before seeding it, including dependency cycles.
    for (const links of affected) {
      links.roots = null;
    }

    for (const links of affected) {
      for (const [source, dependency] of links.sources) {
        if (dependency.ordering > 0) {
          links.addBarrier(source);
        }

        const { roots } = source;

        if (affected.has(source) || !roots) {
          continue;
        }

        for (const root of roots) {
          links.addBarrier(root);
        }
      }
    }
  }

  destroy() {
    const targets = [...this.targets.keys()];

    for (const source of this.sources.keys()) {
      source.targets.delete(this);
    }

    for (const target of targets) {
      target.sources.delete(this);
    }

    const hadBarriers = this.roots !== null;

    this.sources.clear();

    this.targets.clear();

    this.roots = null;

    if (hadBarriers || targets.some((target) => target.roots?.has(this))) {
      this.rebuild(targets);
    }
  }
}

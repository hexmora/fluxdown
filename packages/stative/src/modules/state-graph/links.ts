type Dependency = {
  normal: number;
  ordering: number;
};

/** Track ordering prerequisites without spreading value invalidation through them. */
export class StateLinks<T> {
  readonly sources = new Map<StateLinks<T>, Dependency>();

  readonly targets = new Map<StateLinks<T>, Dependency>();

  /** One supporting path per root; null marks a direct ordering prerequisite. */
  private roots: Map<StateLinks<T>, StateLinks<T> | null> | null = null;

  constructor(readonly node: T) {}

  get barriers(): ReadonlyMap<StateLinks<T>, StateLinks<T> | null> | null {
    return this.roots;
  }

  private addBarrier(root: StateLinks<T>, support: StateLinks<T> | null) {
    if (this.roots?.has(root)) {
      if (support === null) {
        this.roots.set(root, null);
      }

      return;
    }

    this.roots ??= new Map();

    this.roots.set(root, support);

    const pending: StateLinks<T>[] = [this];

    for (let index = 0; index < pending.length; index++) {
      const links = pending[index];

      for (const target of links.targets.keys()) {
        if (target.roots?.has(root)) {
          continue;
        }

        target.roots ??= new Map();

        target.roots.set(root, links);

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
        this.addBarrier(source, null);
      }
    } else {
      dependency.normal += 1;
    }

    const { roots } = source;

    if (!connected && roots) {
      for (const root of roots.keys()) {
        this.addBarrier(root, source);
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

    if (!this.repair(source)) {
      this.rebuild([this]);
    }
  }

  private static reachesBarrier<TNode>(
    source: StateLinks<TNode>,
    root: StateLinks<TNode>,
    excluded: StateLinks<TNode>,
  ) {
    // A path that returns through the dependent cannot replace its removed support.
    const visited = new Set([excluded]);

    let current = source;

    while (!visited.has(current)) {
      visited.add(current);

      const support = current.roots?.get(root);

      if (support === null) {
        return (current.sources.get(root)?.ordering ?? 0) > 0;
      }

      if (!support || !current.sources.has(support)) {
        return false;
      }

      current = support;
    }

    return false;
  }

  private repair(removed: StateLinks<T>) {
    if (!this.roots) {
      return true;
    }

    for (const [root, support] of this.roots) {
      if (support !== removed && !(support === null && root === removed)) {
        continue;
      }

      if ((this.sources.get(root)?.ordering ?? 0) > 0) {
        this.roots.set(root, null);

        continue;
      }

      let replacement: StateLinks<T> | undefined;

      for (const source of this.sources.keys()) {
        if (StateLinks.reachesBarrier(source, root, this)) {
          replacement = source;

          break;
        }
      }

      if (!replacement) {
        return false;
      }

      this.roots.set(root, replacement);
    }

    return true;
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
          links.addBarrier(source, null);
        }

        const { roots } = source;

        if (affected.has(source) || !roots) {
          continue;
        }

        for (const root of roots.keys()) {
          links.addBarrier(root, source);
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
      this.rebuild(targets.filter((target) => !target.repair(this)));
    }
  }
}

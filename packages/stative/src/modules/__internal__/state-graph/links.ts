type Dependency = {
  normal: number;
  ordering: number;
};

/** Track ordering prerequisites without spreading value invalidation through them. */
export class StateLinks<T> {
  readonly sources = new Map<StateLinks<T>, Dependency>();

  readonly targets = new Map<StateLinks<T>, Dependency>();

  /** One supporting path per root; null marks a direct ordering prerequisite. */
  private root: StateLinks<T> | null = null;

  private support: StateLinks<T> | null = null;

  private roots: Map<StateLinks<T>, StateLinks<T> | null> | null = null;

  constructor(readonly node: T) {}

  get barrier(): StateLinks<T> | null {
    return this.root;
  }

  /** Additional roots beyond the inline barrier. */
  get barriers(): ReadonlyMap<StateLinks<T>, StateLinks<T> | null> | null {
    return this.roots;
  }

  private hasBarrier(root: StateLinks<T>) {
    return this.root === root || Boolean(this.roots?.has(root));
  }

  private getSupport(root: StateLinks<T>) {
    return this.root === root ? this.support : this.roots?.get(root);
  }

  private setBarrier(root: StateLinks<T>, support: StateLinks<T> | null) {
    if (!this.root || this.root === root) {
      this.root = root;

      this.support = support;

      return;
    }

    this.roots ??= new Map();

    this.roots.set(root, support);
  }

  private clearBarriers() {
    this.root = null;

    this.support = null;

    this.roots = null;
  }

  private inheritBarriers(source: StateLinks<T>) {
    if (source.root) {
      this.addBarrier(source.root, source);
    }

    if (source.roots) {
      for (const root of source.roots.keys()) {
        this.addBarrier(root, source);
      }
    }
  }

  private addBarrier(root: StateLinks<T>, support: StateLinks<T> | null) {
    if (this.hasBarrier(root)) {
      if (support === null) {
        this.setBarrier(root, null);
      }

      return;
    }

    this.setBarrier(root, support);

    if (this.targets.size === 0) {
      return;
    }

    const pending: StateLinks<T>[] = [this];

    for (let index = 0; index < pending.length; index++) {
      const links = pending[index];

      for (const target of links.targets.keys()) {
        if (target.hasBarrier(root)) {
          continue;
        }

        target.setBarrier(root, links);

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

    if (!connected && source.root) {
      this.inheritBarriers(source);
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

      if (!ordering && !source.root) {
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

      const support = current.getSupport(root);

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
    if (this.root && !this.repairBarrier(this.root, this.support, removed)) {
      return false;
    }

    if (this.roots) {
      for (const [root, support] of this.roots) {
        if (!this.repairBarrier(root, support, removed)) {
          return false;
        }
      }
    }

    return true;
  }

  private repairBarrier(
    root: StateLinks<T>,
    support: StateLinks<T> | null,
    removed: StateLinks<T>,
  ) {
    if (support !== removed && !(support === null && root === removed)) {
      return true;
    }

    if ((this.sources.get(root)?.ordering ?? 0) > 0) {
      this.setBarrier(root, null);

      return true;
    }

    for (const source of this.sources.keys()) {
      if (StateLinks.reachesBarrier(source, root, this)) {
        this.setBarrier(root, source);

        return true;
      }
    }

    return false;
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
      links.clearBarriers();
    }

    for (const links of affected) {
      for (const [source, dependency] of links.sources) {
        if (dependency.ordering > 0) {
          links.addBarrier(source, null);
        }

        if (affected.has(source)) {
          continue;
        }

        links.inheritBarriers(source);
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

    const hadBarriers = this.root !== null;

    this.sources.clear();

    this.targets.clear();

    this.clearBarriers();

    if (hadBarriers || targets.some((target) => target.hasBarrier(this))) {
      this.rebuild(targets.filter((target) => !target.repair(this)));
    }
  }
}

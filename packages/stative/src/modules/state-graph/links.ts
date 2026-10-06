/** One shared edge holds both subscription counts and both adjacency links. */
export class StateDependency<T> {
  normal = 0;

  ordering = 0;

  previousSource: StateDependency<T> | null = null;

  nextSource: StateDependency<T> | null = null;

  previousTarget: StateDependency<T> | null = null;

  nextTarget: StateDependency<T> | null = null;

  constructor(
    public source: StateLinks<T> | null,
    public target: StateLinks<T> | null,
    readonly order: number,
  ) {}
}

const indexThreshold = 16;

/** Track ordering prerequisites without spreading value invalidation through them. */
export class StateLinks<T> {
  firstSource: StateDependency<T> | null = null;

  private lastSource: StateDependency<T> | null = null;

  firstTarget: StateDependency<T> | null = null;

  private lastTarget: StateDependency<T> | null = null;

  private sourceCount = 0;

  /** Settling frames restart only when a callback changes this adjacency list. */
  sourceVersion = 0;

  private sourceIndex: Map<StateLinks<T>, StateDependency<T>> | null = null;

  /** One supporting path per root; null marks a direct ordering prerequisite. */
  private roots: Map<StateLinks<T>, StateLinks<T> | null> | null = null;

  constructor(readonly node: T) {}

  get barriers(): ReadonlyMap<StateLinks<T>, StateLinks<T> | null> | null {
    return this.roots;
  }

  getSource(source: StateLinks<T>): StateDependency<T> | undefined {
    if (this.sourceIndex) {
      return this.sourceIndex.get(source);
    }

    for (let edge = this.firstSource; edge; edge = edge.nextSource) {
      if (edge.source === source) {
        return edge;
      }
    }

    return undefined;
  }

  private append(source: StateLinks<T>): StateDependency<T> {
    const edge = new StateDependency(source, this, this.sourceVersion + 1);

    edge.previousSource = this.lastSource;

    if (this.lastSource) {
      this.lastSource.nextSource = edge;
    } else {
      this.firstSource = edge;
    }

    this.lastSource = edge;

    edge.previousTarget = source.lastTarget;

    if (source.lastTarget) {
      source.lastTarget.nextTarget = edge;
    } else {
      source.firstTarget = edge;
    }

    source.lastTarget = edge;

    this.sourceCount += 1;

    this.sourceVersion += 1;

    if (this.sourceIndex) {
      this.sourceIndex.set(source, edge);
    } else if (this.sourceCount === indexThreshold) {
      this.sourceIndex = new Map();

      for (let current = this.firstSource; current; current = current.nextSource) {
        this.sourceIndex.set(current.source!, current);
      }
    }

    return edge;
  }

  private remove(edge: StateDependency<T>) {
    const { source, target, previousSource, nextSource, previousTarget, nextTarget } = edge;

    if (!source || !target) {
      return;
    }

    if (previousSource) {
      previousSource.nextSource = nextSource;
    } else {
      target.firstSource = nextSource;
    }

    if (nextSource) {
      nextSource.previousSource = previousSource;
    } else {
      target.lastSource = previousSource;
    }

    if (previousTarget) {
      previousTarget.nextTarget = nextTarget;
    } else {
      source.firstTarget = nextTarget;
    }

    if (nextTarget) {
      nextTarget.previousTarget = previousTarget;
    } else {
      source.lastTarget = previousTarget;
    }

    target.sourceCount -= 1;

    target.sourceVersion += 1;

    target.sourceIndex?.delete(source);

    if (target.sourceCount <= indexThreshold / 2) {
      target.sourceIndex = null;
    }

    edge.source = null;

    edge.target = null;

    edge.previousSource = null;

    edge.nextSource = null;

    edge.previousTarget = null;

    edge.nextTarget = null;
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

      for (let edge = links.firstTarget; edge; edge = edge.nextTarget) {
        const target = edge.target!;

        if (target.roots?.has(root)) {
          continue;
        }

        target.roots ??= new Map();

        target.roots.set(root, links);

        pending.push(target);
      }
    }
  }

  connect(source: StateLinks<T>, ordering: boolean): StateDependency<T> {
    let dependency = this.getSource(source);

    const connected = dependency !== undefined;

    dependency ??= this.append(source);

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

    return dependency;
  }

  disconnect(source: StateLinks<T>, ordering: boolean) {
    const dependency = this.getSource(source);

    if (dependency) {
      this.disconnectEdge(dependency, ordering);
    }
  }

  disconnectEdge(dependency: StateDependency<T>, ordering: boolean) {
    const source = dependency.source;

    if (!source || dependency.target !== this) {
      return;
    }

    if (ordering) {
      dependency.ordering -= 1;
    } else {
      dependency.normal -= 1;
    }

    if (dependency.normal === 0 && dependency.ordering === 0) {
      this.remove(dependency);

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
        return (current.getSource(root)?.ordering ?? 0) > 0;
      }

      if (!support || !current.getSource(support)) {
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

      if ((this.getSource(root)?.ordering ?? 0) > 0) {
        this.roots.set(root, null);

        continue;
      }

      let replacement: StateLinks<T> | undefined;

      for (let edge = this.firstSource; edge; edge = edge.nextSource) {
        const source = edge.source!;

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
      for (let edge = links.firstTarget; edge; edge = edge.nextTarget) {
        affected.add(edge.target!);
      }
    }

    // Clear the whole affected region before seeding it, including dependency cycles.
    for (const links of affected) {
      links.roots = null;
    }

    for (const links of affected) {
      for (let edge = links.firstSource; edge; edge = edge.nextSource) {
        const source = edge.source!;

        if (edge.ordering > 0) {
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
    const targets: StateLinks<T>[] = [];

    for (let edge = this.firstTarget; edge; edge = edge.nextTarget) {
      targets.push(edge.target!);
    }

    while (this.firstSource) {
      this.remove(this.firstSource);
    }

    while (this.firstTarget) {
      this.remove(this.firstTarget);
    }

    const hadBarriers = this.roots !== null;

    this.roots = null;

    if (hadBarriers || targets.some((target) => target.roots?.has(this))) {
      this.rebuild(targets.filter((target) => !target.repair(this)));
    }
  }
}

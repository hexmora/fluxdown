import { shallowEqual } from 'shallow-equal';

export class PresetSnapshot {
  private readonly snapshots: readonly unknown[][];

  private compatible = true;

  constructor(private readonly presets: readonly unknown[][]) {
    this.snapshots = presets.map((plugins) => [...plugins]);
  }

  matches() {
    this.compatible &&= this.snapshots.every((plugins, index) =>
      shallowEqual(plugins, this.presets[index]),
    );

    return this.compatible;
  }
}

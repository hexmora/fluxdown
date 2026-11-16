import { SpringSmoothInterpolator } from '@fluxdown/core-plugins/plugins/mapper/smooth';

/** Keep the spring's behavior, but let its clock advance at one third of real time. */
export class DemoSpringInterpolator extends SpringSmoothInterpolator {
  override start(timestamp: number, index = 0) {
    super.start(timestamp / 3, index);
  }

  override resume(timestamp: number) {
    super.resume(timestamp / 3);
  }

  override push(length: number, timestamp?: number) {
    super.push(length, timestamp === undefined ? undefined : timestamp / 3);
  }

  override tick(timestamp: number) {
    return super.tick(timestamp / 3);
  }
}

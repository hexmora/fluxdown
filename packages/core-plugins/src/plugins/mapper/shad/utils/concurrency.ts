/**
 * Counts characters that are still fading in, across every block of one Shad instance, and
 * picks the fade duration for each new batch from that count.
 */
export class FadeConcurrency {
  private readonly fades: { end: number; count: number }[] = [];

  /**
   * Characters whose fade has not finished at `now`.
   */
  count(now: number) {
    let index = 0;

    while (index < this.fades.length && this.fades[index]!.end <= now) {
      index += 1;
    }

    this.fades.splice(0, index);

    return this.fades.reduce((total, fade) => total + fade.count, 0);
  }

  /**
   * Choose a duration for `added` characters starting at `now` and record them: the longest
   * fade while at most `length` characters are in flight, then proportionally shorter so the
   * in-flight count drifts back toward `length`.
   */
  allocate(now: number, added: number, length: number, duration: number) {
    if (added <= 0) {
      return duration;
    }

    const inFlight = this.count(now) + added;

    const allocated = duration * Math.min(1, length / inFlight);

    const end = now + allocated;

    // Keep the list ordered by end time so expired fades are always at the front.
    let index = this.fades.length;

    while (index > 0 && this.fades[index - 1]!.end > end) {
      index -= 1;
    }

    this.fades.splice(index, 0, { end, count: added });

    return allocated;
  }
}

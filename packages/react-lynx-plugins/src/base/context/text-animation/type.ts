export interface TextColorAnimation {
  arrival: number;
  duration: number;

  /**
   * Timing function for the color fade.
   * @default 'cubic-bezier(0, 0, 0.58, 1)'
   */
  easing?: string;
}

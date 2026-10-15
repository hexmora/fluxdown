export class MissingSlotError extends Error {
  constructor(type: string) {
    super(
      `The ${type} slot is required. Provide a platform slot plugin before rendering this content.`,
    );

    this.name = 'MissingSlotError';
  }
}

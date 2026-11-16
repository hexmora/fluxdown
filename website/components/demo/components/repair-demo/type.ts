import type { Locale } from '../../../type';

export type RepairSample = {
  id: string;
  label: Record<Locale, string>;
  source: string;
};

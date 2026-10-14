import type { FeatureIconProps } from './type';

export const FeatureIcon = ({ index }: FeatureIconProps) => (
  <svg
    aria-hidden="true"
    width="30"
    height="30"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {index === 0 && (
      <>
        <path d="M5 8h20M5 16h14M5 24h20" />
        <path d="m23 13 4 3-4 3" />
      </>
    )}
    {index === 1 && (
      <>
        <rect x="4" y="5" width="24" height="22" rx="3" />
        <path d="M4 12h24M12 12v15m7-10 2 2 4-4" />
      </>
    )}
    {index === 2 && (
      <>
        <rect x="3" y="12" width="8" height="8" rx="2" />
        <rect x="21" y="3" width="8" height="8" rx="2" />
        <rect x="21" y="21" width="8" height="8" rx="2" />
        <path d="M11 16h4c3 0 2-9 6-9m-6 9c3 0 2 9 6 9" />
      </>
    )}
    {index === 3 && (
      <>
        <path d="M7 3v9m0 7v10M16 3v18m0 6v2M25 3v3m0 7v16" />
        <circle cx="7" cy="15.5" r="3.5" />
        <circle cx="16" cy="24" r="3.5" />
        <circle cx="25" cy="9.5" r="3.5" />
      </>
    )}
    {index === 4 && (
      <>
        <path d="m16 3 13 7-13 7L3 10 16 3Zm-13 13 13 7 13-7M3 22l13 7 13-7" />
      </>
    )}
    {index === 5 && (
      <>
        <path d="m5 8 5-5m-5 5 5 5M27 24l-5-5m5 5-5 5M20 4l-8 24M3 21h5M24 10h5" />
      </>
    )}
  </svg>
);

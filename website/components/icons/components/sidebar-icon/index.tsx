import type { IconProps } from '../../type';

export const SidebarIcon = (props: IconProps) => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    aria-hidden="true"
    {...props}
  >
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M9 4v16m-3-11v6" strokeLinecap="round" />
  </svg>
);

import type { JSX } from 'solid-js';

export interface ImageClickParams {
  event: MouseEvent;
}

export interface LinkClickParams {
  event: MouseEvent;
}

declare global {
  interface SolidSlotBaseAttributes {
    class?: string;

    style?: JSX.CSSProperties | string;
  }

  interface SolidImageSlotAttributes {
    onClick?: (params: ImageClickParams) => void;
  }

  interface SolidLinkSlotAttributes {
    onClick?: (params: LinkClickParams) => void;
  }
}

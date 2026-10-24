import type { CSSProperties, MouseEvent } from 'react';

export interface ImageClickParams {
  event: MouseEvent<HTMLImageElement>;
}

export interface LinkClickParams {
  event: MouseEvent<HTMLAnchorElement>;
}

declare global {
  interface SlotBaseAttributes {
    className?: string;

    style?: CSSProperties;
  }

  interface ImageSlotAttributes {
    onClick?: (params: ImageClickParams) => void;
  }

  interface LinkSlotAttributes {
    onClick?: (params: LinkClickParams) => void;
  }
}

import type { BaseEventOrig } from '@tarojs/components';
import type { CSSProperties } from 'react';

export interface ImageTapParams {
  event: BaseEventOrig;
}

export interface LinkTapParams {
  event: BaseEventOrig;
}

declare global {
  interface SlotBaseAttributes {
    className?: string;
    style?: CSSProperties;
  }

  interface ImageSlotAttributes {
    onTap?: (params: ImageTapParams) => void;
  }

  interface LinkSlotAttributes {
    onTap?: (params: LinkTapParams) => void;
  }
}

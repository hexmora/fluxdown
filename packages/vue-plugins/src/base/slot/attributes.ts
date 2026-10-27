import type { HTMLAttributes, StyleValue } from 'vue';

export interface ImageClickParams {
  event: MouseEvent;
}

export interface LinkClickParams {
  event: MouseEvent;
}

declare global {
  interface VueSlotBaseAttributes {
    class?: HTMLAttributes['class'];

    style?: StyleValue;
  }

  interface VueImageSlotAttributes {
    onClick?: (params: ImageClickParams) => void;
  }

  interface VueLinkSlotAttributes {
    onClick?: (params: LinkClickParams) => void;
  }
}

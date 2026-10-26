import type { GestureResponderEvent } from 'react-native';

export interface ImagePressParams {
  event: GestureResponderEvent;
}

export interface LinkPressParams {
  event: GestureResponderEvent;
}

declare global {
  interface SlotBaseAttributes {
    nativeID?: string;

    accessibilityLabel?: string;
  }

  interface ImageSlotAttributes {
    onPress?: (params: ImagePressParams) => void;
  }

  interface LinkSlotAttributes {
    onPress?: (params: LinkPressParams) => void;
  }
}

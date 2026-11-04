import type { LynxDemoData } from '../../../../../../react-lynx/type';

export type LynxPreviewProps = {
  data: LynxDemoData;
  renderer: 'react-lynx' | 'vue-lynx';

  errorLabel: string;
};

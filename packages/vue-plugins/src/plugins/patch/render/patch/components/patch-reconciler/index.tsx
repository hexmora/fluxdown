import { defineComponent } from 'vue';

import type { PatchReconcilerProps } from './type';

import { useStateValue } from '../../../../../../base/composables';

export const PatchReconciler = /*#__PURE__*/ defineComponent(
  (props: PatchReconcilerProps) => {
    const patches = useStateValue(() => props.patches);

    return () => {
      const patch = patches.value.find(({ key }) => key === props.patchKey)?.render;

      return patch ? patch(props.text) : null;
    };
  },
  { name: 'FluxdownPatchReconciler', props: ['patchKey', 'patches', 'text'], inheritAttrs: false },
);

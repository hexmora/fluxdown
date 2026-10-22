# @fluxdown/core-presets

Headless preset mapper, remark, rehype, and repair plugins for Fluxdown.

[简体中文](./docs/README.zh-CN.md)

Import each preset through its own entry point:

```ts
import { PRESET_MAPPER_PLUGINS } from "@fluxdown/core-presets/presets/mapper";
import { PRESET_REHYPE_PLUGINS } from "@fluxdown/core-presets/presets/rehype";
import { PRESET_REMARK_PLUGINS } from "@fluxdown/core-presets/presets/remark";
import { PRESET_REPAIR_PLUGINS } from "@fluxdown/core-presets/presets/repair";
```

The package has no root export. Preset entry points export only their plugin arrays. Import individual plugins, configuration types, and shared base classes through `@fluxdown/core-presets/plugins/<type>/<name>`.

# @fluxdown/core-presets

Fluxdown 的无界面 mapper、remark、rehype 和 repair 预设插件。

[English](../README.md)

按预设类型从对应入口导入：

```ts
import { PRESET_MAPPER_PLUGINS } from "@fluxdown/core-presets/presets/mapper";
import { PRESET_REHYPE_PLUGINS } from "@fluxdown/core-presets/presets/rehype";
import { PRESET_REMARK_PLUGINS } from "@fluxdown/core-presets/presets/remark";
import { PRESET_REPAIR_PLUGINS } from "@fluxdown/core-presets/presets/repair";
```

包没有根导出。预设入口仅导出插件数组。插件、配置类型和共享基类从 `@fluxdown/core-presets/plugins/<type>/<name>` 单独导入。

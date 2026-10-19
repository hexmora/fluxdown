# @fluxdown/core-presets

Fluxdown 的无界面 mapper、remark、rehype 和 repair 预设插件。

[English](../README.md)

按插件类型从对应入口导入：

```ts
import { PRESET_MAPPER_PLUGINS } from "@fluxdown/core-presets/mapper";
import { PRESET_REHYPE_PLUGINS } from "@fluxdown/core-presets/rehype";
import { PRESET_REMARK_PLUGINS } from "@fluxdown/core-presets/remark";
import { PRESET_REPAIR_PLUGINS } from "@fluxdown/core-presets/repair";
```

包没有根导出。各入口导出对应的插件、配置类型和共享基类；mapper 入口还导出平滑输出的时钟与调度器模块。

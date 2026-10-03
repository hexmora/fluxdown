---
"@fluxdown/core": minor
"@fluxdown/types": minor
---

Keep the document block count separate from per-block compilation inputs so adding a block does not revisit stable compilation contexts. Public block metadata continues to report the current count through IBlockMeta; IBlockRawMeta now contains only character offsets and the block index. Advanced compiler integrations must pass section, meta, isLast, and count closures directly to CompiledBlock instead of an item closure. BlockCompilerItem.meta matches IBlockRawMeta exactly and uses an explicit isLast flag instead of meta.blockCount.

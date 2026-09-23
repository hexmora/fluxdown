---
"stative": patch
---

Fix history-dependent mappings when a batch activates a lazy branch. New subscriptions now receive the settled upstream value without first replaying a stale value into the mapper's previous result.

---
"@fluxdown/react-native-plugins": patch
"@fluxdown/react-native": patch
"@fluxdown/core-plugins": patch
"@fluxdown/core": patch
"@fluxdown/react-base": patch
"@fluxdown/react-base-plugins": patch
"@fluxdown/hast": patch
---

Keep native streaming text on a stable baseline while measuring and drawing inline effects. Restore chunk fades through text color alpha and preserve inherited typography without platform-specific rendering branches.

Keep active scale words and characters mounted when settled text is collapsed during streaming.

Keep shad measurements attached to complete words and stable text positions as the active tail moves, preserving settled prefixes while layouts update.

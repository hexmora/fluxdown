# Meet Fluxdown

Fluxdown keeps Markdown readable while it is being generated. It turns uneven bursts of text into a smooth reading experience and handles unfinished bold text, links, and code, so readers can follow along without waiting for the formatting to settle.

Use it for AI conversations, live writing, streaming reports, or any interface where content keeps growing.

## Where to start

| What you need                                             | Start here                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Display Markdown and streaming responses in a React app   | [React quick start](./react/quick-start.md) · `fluxdown`                             |
| Display Markdown and streaming content in a Vue 3 app     | [Vue quick start](./vue/quick-start.md) · `@fluxdown/vue`                            |
| Render on iOS, Android, or React Native Web               | [React Native quick start](./react-native/quick-start.md) · `@fluxdown/react-native` |
| Display Markdown and streaming content in a ReactLynx app | [Lynx quick start](./lynx/quick-start.md) · `@fluxdown/lynx`                         |
| Display Markdown and streaming content in a Solid app     | [Solid quick start](./solid/quick-start.md) · `@fluxdown/solid`                      |
| Display Markdown and streaming content in a Taro app | [Taro quick start](./taro/quick-start.md) · `@fluxdown/taro` |
| Use another framework or control how content is presented | [Core quick start](./core/quick-start.md) · `@fluxdown/core`                         |

Framework components provide a ready-to-use presentation layer. Core handles Markdown independently of any UI framework. Both share the same syntax, repair, and streaming capabilities.

## Made for content in progress

**A natural reading pace.** Receive text at the server's pace and reveal it smoothly on the page. There is no need to split every network chunk into individual characters yourself.

**Readable before the syntax is complete.** A stream often pauses at `**important` or halfway through a link. Fluxdown gives these intermediate states a useful presentation, then updates it as more text arrives.

**At home in your product.** Themes control typography, spacing, and color. Plugins control how links, code blocks, formulas, and other content look and behave. Adjust one piece at a time, or keep the defaults and add your own interactions.

## One core, different interfaces

Fluxdown is built on [stative](../stative/index.md), which connects text, configuration, and output in a single reactive data flow. React, Vue, React Native, Lynx, Solid and Taro have ready-to-use integrations.

Start with the quick start for [React](./react/quick-start.md), [Vue 3](./vue/quick-start.md), [React Native](./react-native/quick-start.md), [Lynx](./lynx/quick-start.md), [Solid](./solid/quick-start.md), or [Taro](./taro/quick-start.md). Explore Core when you need to handle the output yourself.

// Preload hook: makes bare `import "*.json"` work under Node v24
// (which requires `with { type: "json" }`) so storage.js can be tested
// without modifying it.
import { registerHooks } from "node:module";

registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith(".json")) {
      context = {
        ...context,
        importAttributes: { ...context.importAttributes, type: "json" },
      };
    }
    return nextLoad(url, context);
  },
});

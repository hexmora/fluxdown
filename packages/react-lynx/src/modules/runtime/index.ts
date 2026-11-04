import 'background-only';
import 'core-js/modules/es.array.at.js';
import 'core-js/modules/es.object.has-own.js';

// Keep the host's missing built-ins available to Core and its parser dependencies.
export const ensureRuntime = () => ({ at: Array.prototype.at, hasOwn: Object.hasOwn });

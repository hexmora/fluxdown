import Prism from 'prismjs';

Prism.manual = true;

// Language components share Prism through the runtime's global object.
Object.assign(globalThis, { Prism });

export default Prism;

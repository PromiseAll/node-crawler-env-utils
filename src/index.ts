import { defineWindowEnv } from './env/window';
import { toObjectTag, toFnNative } from './env/fun';
import { setEnvProxy } from './hook/proxy';

export { defineWindowEnv, toObjectTag, toFnNative, setEnvProxy };

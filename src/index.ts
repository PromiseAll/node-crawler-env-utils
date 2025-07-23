import { defineWindowEnv } from './env/window';
import { toObjectTag, toFnNative, definedValue } from './env/fun';
import { setEnvProxy } from './hook/proxy';

export { defineWindowEnv, toObjectTag, toFnNative, definedValue, setEnvProxy };

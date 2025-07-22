import { defineWindowEnv } from './env/window';
import { setEnvProxy } from './hook/proxy';

defineWindowEnv();

setEnvProxy({
  paths: ['XMLHttpRequest'],
  logConfig: {
    level: 1,
  },
});

// console.log(XMLHttpRequest.window);

// eval("XMLHttpReques")

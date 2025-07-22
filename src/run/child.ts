export const listenMEnvMessage = (processName: string, run: Function) => {
  run();
  const envName = `windows-env-${processName}`;
  process.on(envName, async (data: any) => {
    const { requestId, paylod } = data;
    // 生成方法
    const _data = await globalThis.generateData(paylod);
    process.send({
      envName: envName,
      data: _data,
      id: requestId,
    });
  });
};

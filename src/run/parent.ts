import { fork } from 'child_process';
class EnvProccessManager {
  process;
  envName;
  private pendingRequests: Map<
    string,
    {
      resolve: (value: string) => void;
      reject: (reason?: any) => void;
    }
  > = new Map();

  constructor(envName: string, filePath: string) {
    this.envName = envName;
    this.process = fork(filePath);
    this.initParentProcessListener();
  }

  async generateData(payload: any) {
    const requestId = this.generateRequestId();
    const { promise, resolve, reject } = Promise.withResolvers<string>();
    this.pendingRequests.set(requestId, { resolve, reject });
    try {
      this.process.send({
        requestId,
        payload,
      });
    } catch (error) {
      this.pendingRequests.delete(requestId);
      reject(error);
    }
    return promise;
  }

  initParentProcessListener() {
    this.process.on(`window-env-${this.envName}`, async (data: any) => {
      const { requestId, payload } = data;
      const pendingRequest = this.pendingRequests.get(requestId);
      if (pendingRequest) {
        pendingRequest.resolve(payload);
        this.pendingRequests.delete(requestId);
      }
    });
  }
  // 生成唯一请求ID的公共方法
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
}

export { EnvProccessManager };
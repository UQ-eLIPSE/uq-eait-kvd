/// <reference types="node" />
export declare class Client {
    private readonly socket;
    readonly address: string;
    readonly port: number;
    private responseCallbackMap;
    constructor(address?: string, port?: number);
    request(key: string, timeout?: number): Promise<Buffer>;
    delete(key: string, timeout?: number): Promise<void>;
    private waitForResponse(key, responseCode, timeout?);
    private processResponse(response);
    private getResponseCallback(key, responseCode);
    private registerResponseCallback(key, responseCode, callback);
    private deleteResponseCallback(key, responseCode);
    private generateResponseCallbackMapKey(key, responseCode);
    private send(message);
    destroy(): void;
}

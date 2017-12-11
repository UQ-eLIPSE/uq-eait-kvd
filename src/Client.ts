import * as dgram from "dgram";

import * as Message from "./Message";
import * as Datagram from "./Datagram";
import { Operation } from "./Operation";

type ResponseCallback = (msg: Message.UnpackedMessage) => void;

export class Client {
    private readonly socket: dgram.Socket;

    public readonly address: string;
    public readonly port: number;

    private responseCallbackMap = new Map<string, ResponseCallback>();

    constructor(address: string = "172.23.84.20", port: number = 1080) {
        this.socket = Datagram.openSocket();

        // Attach message listener to process response as they arrive
        Datagram.attachMessageListener(this.socket, response => this.processResponse(response));

        this.address = address;
        this.port = port;
    }

    public async request(key: string, payload?: Buffer, timeout?: number) {
        const request = Message.pack(Operation.REQUEST, key, payload);
        this.send(request);

        // We either get VALUE or NOVALUE from the server
        const { operation, payload: responsePayload } =
            await this.waitForResponse(key, [Operation.VALUE, Operation.NOVALUE], timeout);

        // If the response is NOVALUE, then the key is invalid
        if (operation === Operation.NOVALUE) {
            throw new Error("Key invalid");
        }

        // Return response payload
        return responsePayload;
    }

    public async delete(key: string, payload?: Buffer, timeout?: number) {
        const request = Message.pack(Operation.DELETE, key, payload);
        this.send(request);
        await this.waitForResponse(key, Operation.DELETED, timeout);
    }

    private async waitForResponse(key: string, responseCode: Operation | Operation[], timeout: number = 1000) {
        return new Promise<Message.UnpackedMessage>((resolve, reject) => {
            if (!Array.isArray(responseCode)) {
                responseCode = [responseCode];
            }

            // Set timeout handler
            const timeoutHandle = setTimeout(() => {
                reject(new Error(`Request timed out`));
            }, timeout);

            // Register the callback for the response from the server
            responseCode.forEach((code) => {
                this.registerResponseCallback(key, code, (msg) => {
                    // Clear timeout now
                    clearTimeout(timeoutHandle);

                    // Resolve the Promise
                    resolve(msg);

                    // We need to clear the response callbacks when it has run
                    this.deleteResponseCallback(key, responseCode);
                });
            });
        });
    }

    private processResponse(response: Buffer) {
        // Unpack the message
        const msg = Message.unpack(response);

        // Get the callback to run
        const { operation, key } = msg;
        const callback = this.getResponseCallback(key, operation);

        // If there is no handler, we'll need to ignore the message
        if (callback === undefined) {
            return;
        }

        // Otherwise, run the callback
        callback(msg);
    }

    private getResponseCallback(key: string, responseCode: Operation) {
        const mapKey = this.generateResponseCallbackMapKey(key, responseCode);
        return this.responseCallbackMap.get(mapKey);
    }

    private registerResponseCallback(key: string, responseCode: Operation, callback: ResponseCallback) {
        const mapKey = this.generateResponseCallbackMapKey(key, responseCode);
        this.responseCallbackMap.set(mapKey, callback);
    }

    private deleteResponseCallback(key: string, responseCode: Operation | Operation[]) {
        if (!Array.isArray(responseCode)) {
            responseCode = [responseCode];
        }

        responseCode.forEach((code) => {
            const mapKey = this.generateResponseCallbackMapKey(key, code);
            this.responseCallbackMap.delete(mapKey);
        });
    }

    private generateResponseCallbackMapKey(key: string, responseCode: Operation) {
        return `${key}__${responseCode}`;
    }

    private send(message: Message.PackedMessage) {
        this.socket.send(message, this.port, this.address);
    }

    public destroy() {
        // Close the socket now
        this.socket.close();

        // Wipe the map to prevent memory leaks
        this.responseCallbackMap = new Map();
    }
}

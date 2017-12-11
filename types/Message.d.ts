/// <reference types="node" />
import { Operation } from "./Operation";
export interface PackedMessage extends Buffer {
}
export interface UnpackedMessage {
    operation: Operation;
    size: number;
    key: string;
    payload: Buffer;
}
export declare function pack(operation: Operation, key: string, payload?: Buffer): PackedMessage;
export declare function unpack(buffer: Buffer): UnpackedMessage;

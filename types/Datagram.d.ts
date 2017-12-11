/// <reference types="node" />
import * as dgram from "dgram";
export declare function openSocket(socketType?: dgram.SocketType): dgram.Socket;
export declare function attachMessageListener(socket: dgram.Socket, callback: (msg: Buffer, rinfo: dgram.AddressInfo) => void): void;

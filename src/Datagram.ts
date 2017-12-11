import * as dgram from "dgram";

export function openSocket(socketType: dgram.SocketType = "udp4") {
    // Create the UDP socket and bind immediately for listening
    const socket = dgram.createSocket(socketType);
    socket.bind();

    return socket;
}

export function attachMessageListener(socket: dgram.Socket, callback: (msg: Buffer, rinfo: dgram.AddressInfo) => void) {
    socket.on("message", callback);
}

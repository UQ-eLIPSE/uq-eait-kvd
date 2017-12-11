"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dgram = require("dgram");
function openSocket(socketType) {
    if (socketType === void 0) { socketType = "udp4"; }
    // Create the UDP socket and bind immediately for listening
    var socket = dgram.createSocket(socketType);
    socket.bind();
    return socket;
}
exports.openSocket = openSocket;
function attachMessageListener(socket, callback) {
    socket.on("message", callback);
}
exports.attachMessageListener = attachMessageListener;

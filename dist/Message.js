"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Operation_1 = require("./Operation");
function pack(operation, key, payload) {
    var size = payload === undefined ? 0 : payload.byteLength;
    // Check that size does not exceed uint16
    if (size > 65535) {
        throw new Error("Payload size exceeds maximum size of 65535 bytes");
    }
    // Build up message components
    // 1 byte for operation code, written in as uint8
    var operationBuffer = Buffer.alloc(1);
    operationBuffer.writeUInt8(operation, 0);
    // Null byte
    var nullByteBuffer = Buffer.alloc(1, 0);
    // 2 bytes for size, written in as uint16, big endian
    var sizeBuffer = Buffer.alloc(2);
    sizeBuffer.writeUInt16BE(size, 0);
    // 32 bytes for key, written in as ascii bytes
    var keyBuffer = Buffer.alloc(32);
    keyBuffer.write(key, 0, 32, "ascii");
    // Pack everything together into one large buffer
    var bufferList = [operationBuffer, nullByteBuffer, sizeBuffer, keyBuffer];
    if (payload !== undefined) {
        bufferList.push(payload);
    }
    return Buffer.concat(bufferList);
}
exports.pack = pack;
function unpack(buffer) {
    /*
     * Buffer contents:
     *
     * Byte | Name
     * --------------------------------------
     *    0 | Operation code (uint8)
     *    1 | Null byte
     *  2-3 | Size (uint16, big endian)
     * 4-35 | Key (base64 = ascii)
     * 36-* | Payload (length = `size` bytes)
     *
     */
    // Expect at least 36 bytes in buffer
    if (buffer.byteLength < 36) {
        throw new Error("Expected at least 36 bytes for buffer, received " + buffer.byteLength + " bytes");
    }
    // Extract data
    var operation = buffer.readUInt8(0);
    var nullByte = buffer.readUInt8(1);
    var size = buffer.readUInt16BE(2);
    var keyBuffer = buffer.slice(4, 36);
    var payload = buffer.slice(36, size + 36);
    // Check that null byte is indeed zero
    if (nullByte !== 0) {
        throw new Error("Buffer contents for \"null\" not equal to the zero byte");
    }
    // Check that the operation byte value is equal to those in the enum object
    if (Operation_1.Operation[operation] === undefined) {
        throw new Error("Buffer contents for \"operation\" not equal to known operation code");
    }
    // Check lengths of buffers
    if (keyBuffer.byteLength !== 32) {
        throw new Error("Buffer contents for \"key\" not equal to 32 bytes");
    }
    if (payload.byteLength !== size) {
        throw new Error("Buffer contents for \"payload\" not equal to expected size " + size + " bytes");
    }
    // Decode key as string
    var key = keyBuffer.toString("ascii");
    // Return result in object
    var result = {
        operation: operation,
        size: size,
        key: key,
        payload: payload,
    };
    return result;
}
exports.unpack = unpack;

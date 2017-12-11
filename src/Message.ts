import { Operation } from "./Operation";

export interface PackedMessage extends Buffer { }

export interface UnpackedMessage {
    operation: Operation,
    size: number,
    key: string,
    payload: Buffer,
}

export function pack(operation: Operation, key: string, payload?: Buffer) {
    const size = payload === undefined ? 0 : payload.byteLength;

    // Check that size does not exceed uint16
    if (size > 65535) {
        throw new Error(`Payload size exceeds maximum size of 65535 bytes`);
    }

    // Build up message components

    // 1 byte for operation code, written in as uint8
    const operationBuffer = Buffer.alloc(1);
    operationBuffer.writeUInt8(operation, 0);

    // Null byte
    const nullByteBuffer = Buffer.alloc(1, 0);

    // 2 bytes for size, written in as uint16, big endian
    const sizeBuffer = Buffer.alloc(2);
    sizeBuffer.writeUInt16BE(size, 0);

    // 32 bytes for key, written in as ascii bytes
    const keyBuffer = Buffer.alloc(32);
    keyBuffer.write(key, 0, 32, "ascii");

    // Pack everything together into one large buffer
    const bufferList = [operationBuffer, nullByteBuffer, sizeBuffer, keyBuffer];

    if (payload !== undefined) {
        bufferList.push(payload);
    }

    return Buffer.concat(bufferList) as PackedMessage;
}

export function unpack(buffer: Buffer) {
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
        throw new Error(`Expected at least 36 bytes for buffer, received ${buffer.byteLength} bytes`);
    }

    // Extract data
    const operation = buffer.readUInt8(0);
    const nullByte = buffer.readUInt8(1);
    const size = buffer.readUInt16BE(2);
    const keyBuffer = buffer.slice(4, 36);
    const payload = buffer.slice(36, size + 36);

    // Check that null byte is indeed zero
    if (nullByte !== 0) {
        throw new Error(`Buffer contents for "null" not equal to the zero byte`);
    }

    // Check that the operation byte value is equal to those in the enum object
    if (Operation[operation] === undefined) {
        throw new Error(`Buffer contents for "operation" not equal to known operation code`);
    }

    // Check lengths of buffers
    if (keyBuffer.byteLength !== 32) {
        throw new Error(`Buffer contents for "key" not equal to 32 bytes`);
    }

    if (payload.byteLength !== size) {
        throw new Error(`Buffer contents for "payload" not equal to expected size ${size} bytes`);
    }

    // Decode key as string
    const key = keyBuffer.toString("ascii");

    // Return result in object
    const result: UnpackedMessage = {
        operation,
        size,
        key,
        payload,
    };

    return result;
}


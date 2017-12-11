"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Message = require("./Message");
var Datagram = require("./Datagram");
var Operation_1 = require("./Operation");
var Client = /** @class */ (function () {
    function Client(address, port) {
        if (address === void 0) { address = "172.23.84.20"; }
        if (port === void 0) { port = 1080; }
        var _this = this;
        this.responseCallbackMap = new Map();
        this.socket = Datagram.openSocket();
        // Attach message listener to process response as they arrive
        Datagram.attachMessageListener(this.socket, function (response) { return _this.processResponse(response); });
        this.address = address;
        this.port = port;
    }
    Client.prototype.request = function (key, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var request, _a, operation, payload;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        request = Message.pack(Operation_1.Operation.REQUEST, key);
                        this.send(request);
                        return [4 /*yield*/, this.waitForResponse(key, [Operation_1.Operation.VALUE, Operation_1.Operation.NOVALUE], timeout)];
                    case 1:
                        _a = _b.sent(), operation = _a.operation, payload = _a.payload;
                        // If the response is NOVALUE, then the key is invalid
                        if (operation === Operation_1.Operation.NOVALUE) {
                            throw new Error("Key invalid");
                        }
                        // Return payload
                        return [2 /*return*/, payload];
                }
            });
        });
    };
    Client.prototype.delete = function (key, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = Message.pack(Operation_1.Operation.DELETE, key);
                        this.send(request);
                        return [4 /*yield*/, this.waitForResponse(key, Operation_1.Operation.DELETED, timeout)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Client.prototype.waitForResponse = function (key, responseCode, timeout) {
        if (timeout === void 0) { timeout = 1000; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (!Array.isArray(responseCode)) {
                            responseCode = [responseCode];
                        }
                        // Set timeout handler
                        var timeoutHandle = setTimeout(function () {
                            reject(new Error("Request timed out"));
                        }, timeout);
                        // Register the callback for the response from the server
                        responseCode.forEach(function (code) {
                            _this.registerResponseCallback(key, code, function (msg) {
                                // Clear timeout now
                                clearTimeout(timeoutHandle);
                                // Resolve the Promise
                                resolve(msg);
                                // We need to clear the response callbacks when it has run
                                _this.deleteResponseCallback(key, responseCode);
                            });
                        });
                    })];
            });
        });
    };
    Client.prototype.processResponse = function (response) {
        // Unpack the message
        var msg = Message.unpack(response);
        // Get the callback to run
        var operation = msg.operation, key = msg.key;
        var callback = this.getResponseCallback(key, operation);
        // If there is no handler, we'll need to ignore the message
        if (callback === undefined) {
            return;
        }
        // Otherwise, run the callback
        callback(msg);
    };
    Client.prototype.getResponseCallback = function (key, responseCode) {
        var mapKey = this.generateResponseCallbackMapKey(key, responseCode);
        return this.responseCallbackMap.get(mapKey);
    };
    Client.prototype.registerResponseCallback = function (key, responseCode, callback) {
        var mapKey = this.generateResponseCallbackMapKey(key, responseCode);
        this.responseCallbackMap.set(mapKey, callback);
    };
    Client.prototype.deleteResponseCallback = function (key, responseCode) {
        var _this = this;
        if (!Array.isArray(responseCode)) {
            responseCode = [responseCode];
        }
        responseCode.forEach(function (code) {
            var mapKey = _this.generateResponseCallbackMapKey(key, code);
            _this.responseCallbackMap.delete(mapKey);
        });
    };
    Client.prototype.generateResponseCallbackMapKey = function (key, responseCode) {
        return key + "__" + responseCode;
    };
    Client.prototype.send = function (message) {
        this.socket.send(message, this.port, this.address);
    };
    Client.prototype.destroy = function () {
        // Close the socket now
        this.socket.close();
        // Wipe the map to prevent memory leaks
        this.responseCallbackMap = new Map();
    };
    return Client;
}());
exports.Client = Client;

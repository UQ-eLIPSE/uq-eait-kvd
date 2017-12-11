"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Operation;
(function (Operation) {
    /** Create new token */
    Operation[Operation["CREATE"] = 0] = "CREATE";
    /** New token created ok */
    Operation[Operation["CREATED"] = 1] = "CREATED";
    /** Get token validity and value */
    Operation[Operation["REQUEST"] = 2] = "REQUEST";
    /** Token valid, value enclosed */
    Operation[Operation["VALUE"] = 3] = "VALUE";
    /** Token invalid */
    Operation[Operation["NOVALUE"] = 4] = "NOVALUE";
    /** Delete token (log out) */
    Operation[Operation["DELETE"] = 5] = "DELETE";
    /** Token deleted ok */
    Operation[Operation["DELETED"] = 6] = "DELETED";
    /** Data sync operations */
    Operation[Operation["SYNC"] = 7] = "SYNC";
    /** Update token payload */
    Operation[Operation["UPDATE"] = 10] = "UPDATE";
    /** Token payload updated ok */
    Operation[Operation["UPDATED"] = 11] = "UPDATED";
    /** Check machine auth signature */
    Operation[Operation["CHECKSIG"] = 12] = "CHECKSIG";
})(Operation = exports.Operation || (exports.Operation = {}));

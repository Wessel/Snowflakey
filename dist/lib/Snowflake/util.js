"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = (duration = 1) => {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, (duration * 1000));
};
exports.getBits = (bits) => {
    return (2 ** bits) - 1;
};

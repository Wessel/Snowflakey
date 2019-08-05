"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Master = require('./Master').default;
exports.Worker = require('./Worker').default;
exports.lookup = (flake, epoch) => {
    return new Date((flake / 4194304) + epoch).toLocaleString();
};
exports.Token = require('./Token').default;

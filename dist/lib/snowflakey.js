"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Master = require('./Snowflake/Master').default;
exports.Worker = require('./Snowflake/Worker').default;
exports.lookup = (flake, epoch) => {
    return new Date((flake / 4194304) + epoch);
};
exports.Token = require('./Token/main').default;

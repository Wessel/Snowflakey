"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bigInt_1 = __importDefault(require("./bigInt"));
const events_1 = require("events");
const util_1 = require("./util");
class SnowflakeWorker extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.setMaxListeners(100);
        this.options = {
            name: undefined,
            async: false,
            stringify: true,
            workerId: 0,
            processId: 0,
            workerBits: 5,
            processBits: 5,
            incrementBits: 12,
            epoch: null,
            ...options
        };
        this._mutable = {
            locks: [],
            locked: false,
            increment: bigInt_1.default.zero.subtract(1),
            lastTimestamp: Date.now()
        };
        if (this.options.incrementBits + this.options.processBits + this.options.workerBits !== 22)
            throw new Error('incrementBits, processBits, and workerBits must add up to 22.');
        this.options.workerId = this.options.workerId % (2 ** this.options.workerBits);
        this.options.processId = this.options.processId % (2 ** this.options.processBits);
        if (isNaN(this.options.workerId))
            this.options.workerId = 0;
        if (isNaN(this.options.processId))
            this.options.processId = 0;
        this._maxIncrement = 2 ** this.options.incrementBits;
        this.workerId = bigInt_1.default(this.options.workerId).shiftLeft(this.options.incrementBits + this.options.processBits);
        this.processId = bigInt_1.default(this.options.processId).shiftLeft(this.options.incrementBits);
        Object.freeze(this.options);
    }
    get increment() {
        return this._mutable.increment = this._mutable.increment.next().mod(this._maxIncrement);
    }
    generate() {
        if (this.options.async)
            return this._generateAsync();
        else
            return this._generate();
    }
    _generate(date = Date.now(), increment = this.increment) {
        let flake = bigInt_1.default(date).minus(this.options.epoch).shiftLeft(22)
            .add(this.workerId)
            .add(this.processId)
            .add(increment);
        this.emit('newSnowflake', {
            worker: this,
            method: 'sync',
            snowflake: flake,
        });
        if (this.options.stringify)
            flake = flake.toString();
        return flake;
    }
    _lock() {
        if (this._mutable.locked)
            return new Promise(res => this._mutable.locks.push(res));
        else
            this._mutable.locked = true;
    }
    _unlock() {
        if (this._mutable.locks.length > 0)
            this._mutable.locks.shift()();
        else
            this._mutable.locked = false;
    }
    async _generateAsync() {
        let lock = this._lock();
        if (lock)
            await lock;
        let now = Date.now();
        if (this._mutable.lastTimestamp !== now) {
            this._mutable.increment = bigInt_1.default.zero;
            this._mutable.lastTimestamp = now;
        }
        else {
            this._mutable.increment = this._mutable.increment.next();
            if (this._mutable.increment.greaterOrEquals(this._maxIncrement)) {
                await util_1.sleep(2 / 1000);
                this._mutable.increment = bigInt_1.default.zero;
                now = this._mutable.lastTimestamp = Date.now();
            }
        }
        let flake = this._generate(now, this._mutable.increment);
        this._unlock();
        this.emit('newSnowflake', {
            worker: this,
            method: 'sync',
            snowflake: flake,
        });
        return flake;
    }
    deconstruct(snowflake, epoch = this.options.epoch) {
        let flake = bigInt_1.default(snowflake);
        let timestamp = flake.shiftRight(22).add(epoch);
        let wBitShift = this.options.incrementBits + this.options.processBits;
        let workerId = flake.and(bigInt_1.default(util_1.getBits(this.options.workerBits)).shiftLeft(wBitShift)).shiftRight(wBitShift);
        let processId = flake.and(bigInt_1.default(util_1.getBits(this.options.processBits)).shiftLeft(this.options.incrementBits)).shiftRight(this.options.incrementBits);
        let increment = flake.and(util_1.getBits(this.options.incrementBits));
        this.emit('deconstructedFlake', {
            worker: this,
            method: 'sync',
            timestamp, workerId, processId, increment
        });
        return { timestamp, workerId, processId, increment };
    }
}
exports.default = SnowflakeWorker;
;

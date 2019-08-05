import big from './bigInt';
import { EventEmitter } from 'events';
import { sleep, getBits } from './util'
import { Snowflake, SnowflakeConfig, SnowflakeMutable } from '../types';

export default class SnowflakeWorker extends EventEmitter {
  public workerId:       number;
  public processId:      number;
  public options:        SnowflakeConfig;
  private _mutable:      SnowflakeMutable;
  private _maxIncrement: number;

  constructor(options: SnowflakeConfig) {
    super();
    // The default options for the generator
    this.setMaxListeners(100);
    this.options = {
      name:          undefined,
      async:         false,
      stringify:     true,
      workerId:      0,
      processId:     0,
      workerBits:    5,
      processBits:   5,
      incrementBits: 12,
      epoch:         null,
      ...options
    };

    // an object containing mutable (unfrozen) properties
    this._mutable = {
      locks:         [],
      locked:        false,
      increment:     big.zero.subtract(1),
      lastTimestamp: Date.now()
    };

    if (this.options.incrementBits + this.options.processBits + this.options.workerBits !== 22) throw new Error('incrementBits, processBits, and workerBits must add up to 22.');
    // ensure that ids conform to the number of bits
    this.options.workerId = this.options.workerId % (2 ** this.options.workerBits);
    this.options.processId = this.options.processId % (2 ** this.options.processBits);

    // check if NaN
    if (isNaN(this.options.workerId)) this.options.workerId = 0;
    if (isNaN(this.options.processId)) this.options.processId = 0;

    // store the maximum increment bound
    this._maxIncrement = 2 ** this.options.incrementBits;

    // calculate the shifted worker/process ids for later reference
    this.workerId = big(this.options.workerId).shiftLeft(this.options.incrementBits + this.options.processBits);
    this.processId = big(this.options.processId).shiftLeft(this.options.incrementBits);

    // freeze immutable objects to prevent tampering
    Object.freeze(this.options);
  }

  get increment(): number {
    return this._mutable.increment = this._mutable.increment.next().mod(this._maxIncrement);
  }

  generate(): Snowflake | Promise<Snowflake> {
    if (this.options.async) return this._generateAsync();
    else return this._generate();
  }

  _generate(date: number = Date.now(), increment: number = this.increment): Snowflake {
    // 0000000000000000000000000000000000000000000000000000000000000000
    // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0000000000000000000000
    let flake: any = big(date).minus(this.options.epoch).shiftLeft(22)
      // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbb00000000000000000
      .add(this.workerId)
      // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbccccc000000000000
      .add(this.processId)
      // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbcccccdddddddddddd
      .add(increment);

    this.emit('newSnowflake', {
      worker: this,
      method: 'sync',
      snowflake: flake,
    });

    if (this.options.stringify) flake = flake.toString();
    return flake;
  }

  private _lock(): Promise<boolean> | void {
    if (this._mutable.locked) return new Promise(res => this._mutable.locks.push(res));
    else this._mutable.locked = true;
  }

  private _unlock():  void {
    if (this._mutable.locks.length > 0) this._mutable.locks.shift()();
    else this._mutable.locked = false;
  }

  private async _generateAsync(): Promise<Snowflake> {
    let lock: any = this._lock();
    if (lock) await lock;
    let now: number = Date.now();
    // check if increment should be reset
    if (this._mutable.lastTimestamp !== now) {
      // last timestamp didnt match, reset increment
      this._mutable.increment = big.zero;
      this._mutable.lastTimestamp = now;
    } else {
      // last timestamp matched, increase increment
      this._mutable.increment = this._mutable.increment.next();
      // check if increment exceeds max bounds
      if (this._mutable.increment.greaterOrEquals(this._maxIncrement)) {
        // sleep for 2ms - 1ms has a risk of timestamp not incrementing for some reason?
        await sleep(2 / 1000);
        // reset increment
        this._mutable.increment = big.zero;
        now = this._mutable.lastTimestamp = Date.now();
      }
    }

    // generate a snowflake with the new increment
    let flake: Snowflake = this._generate(now, this._mutable.increment);
    this._unlock();
    this.emit('newSnowflake', {
      worker: this,
      method: 'sync',
      snowflake: flake,
    });

    return flake;
  }

  deconstruct(snowflake: Snowflake, epoch: number = this.options.epoch): object {
    // turn snowflake into a bigint
    let flake: any = big(snowflake);
    // shift right, and add epoch to obtain timestamp
    let timestamp = flake.shiftRight(22).add(epoch);

    //obtain workerId
    let wBitShift = this.options.incrementBits + this.options.processBits;
    let workerId = flake.and(big(getBits(this.options.workerBits)).shiftLeft(wBitShift)).shiftRight(wBitShift);

    // obtain processId
    let processId = flake.and(big(getBits(this.options.processBits)).shiftLeft(this.options.incrementBits)).shiftRight(this.options.incrementBits);

    // obtain increment
    let increment = flake.and(getBits(this.options.incrementBits));

    this.emit('deconstructedFlake', {
      worker: this,
      method: 'sync',
      timestamp, workerId, processId, increment
    });
    return { timestamp, workerId, processId, increment };
  }
};

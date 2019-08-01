// Type definitions for Snowflakey 0.1.0
// Project: Snowflakey
// Definitions by: Wessel "wesselgame" T <discord@go2it.eu>
declare module 'snowflakey' {
  import { EventEmitter } from 'events';

  export type Snowflake = number;
  export function lookup(flake: number, epoch: number);

  export class Master extends EventEmitter {
    public workers: SnowflakeWorker[];
    public refresh(): void;
    public listWorkers(): SnowflakeWorker[];
    public addWorkers(...workers: any[]): void;
    public removeWorkers(...workers: string[] | number[]): { removed: number };
  }

  export class Worker extends EventEmitter {
    public options: SnowflakeConfig;
    private _mutable: SnowflakeMutable;
    constructor(options: SnowflakeConfig);
    private _lock(): void;
    private _unlock(): void;
    public generate(): Snowflake;
    public deconstruct(flake: Snowflake): DeconstructedSnowflake;
    private _generate(): Snowflake;
    private _generateAsync(): Snowflake;
  }

  export interface DeconstructedSnowflake {
    workerId: number,
    timestamp: number,
    processId: number,
    increment: number
  }
  export interface SnowflakeConfig {
    name?: string;
    async?: boolean;
    epoch: number;
    workerId?: any,
    processId?: number,
    stringify?: boolean,
    workerBits: number,
    processBits: number,
    incrementBits: number
  }

  export interface SnowflakeMutable {
    locks: any;
    locked: boolean;
    increment: any;
    lastTimestamp: number;
  }


  export interface SnowflakeWorker {
    options: SnowflakeConfig;
    workerId: number;
    _mutable: SnowflakeMutable;
    processId: number;
    _maxIncrement: number;
    _lock(): void;
    _unlock(): void;
    generate(): Snowflake;
    _generate(): Snowflake;
    _generateAsync(): Snowflake;
  }
}
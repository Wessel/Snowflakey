// Type definitions for Snowflakey 0.1.0
// Project: Snowflakey
// Definitions by: Wessel "wesselgame" T <discord@go2it.eu>
declare module 'snowflakey' {
  import { EventEmitter } from 'events';

  export type Snowflake = number;
  export function lookup(flake: number, epoch: number): Date;

  export class Token {
    public secret: string;
    public EPOCH: number;
    public VERSION: number;
    public tokenTime: number;
    private _otp: any;

    public constructor(options: TokenConfig);
    public generate(ID: string): string;
    public update(token: string, mfa: string, secret: string, counter: any): string | null
    public validate(token: string, fetcher: any): boolean;

    private _computeHmac(string: string): string;
  }

  export class Master extends EventEmitter {
    constructor();

    public workers: Worker[];
    public refresh(): void;
    public listWorkers(): Worker[];
    public addWorkers(...workers: Worker[]): void;
    public removeWorkers(...workers: string[] | number[]): { removed: number };
    public on(event: 'newSnowflake', listener: (data: NewSnowflake) => void): this;
    public on(event: 'deconstructedFlake', listener: (data: DeconstructedSnowflake) => void): this;
  }

  export class Worker extends EventEmitter {
    private _mutable: SnowflakeMutable;
    public options: SnowflakeConfig;

    constructor(options: SnowflakeConfig);

    public generate(): Snowflake;
    public deconstruct(flake: Snowflake, epoch?: number): DeconstructedSnowflake;
    public on(event: 'newSnowflake', listener: (data: NewSnowflake) => void): this;
    public on(event: 'deconstructedFlake', listener: (data: DeconstructedSnowflake) => void): this;

    private _lock(): Promise<any> | void;
    private _unlock(): void;
    private _generate(): Snowflake;
    private _generateAsync(): Snowflake;
  }

  export interface TokenConfig {
    seed?:    string;
    secret:   string;
    epoch?:   number;
    version?: number;
  }

  export interface DeconstructedSnowflake {
    method:    'sync' | 'async';
    worker:    Worker;
    workerId:  number;
    timestamp: number;
    processId: number;
    increment: number;
  }

  export interface NewSnowflake {
    method:    'sync' | 'async';
    worker:    Worker;
    snowflake: Snowflake;
  }

  export interface SnowflakeConfig {
    name?:         string;
    async?:        boolean;
    stringify?:    boolean,
    workerId?:     any,
    epoch:         number;
    processId?:    number,
    workerBits:    number,
    processBits:   number,
    incrementBits: number
  }

  export interface SnowflakeMutable {
    locks:         [];
    locked:        boolean;
    increment:     number;
    lastTimestamp: number;
  }
}

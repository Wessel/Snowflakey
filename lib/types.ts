export interface SnowflakeConfig {
  name?: string;
  async?: boolean;
  epoch?: number;
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

export type Snowflake = number;

export interface SnowflakeWorker {
  options:          SnowflakeConfig;
  workerId:         number;
  _mutable:         SnowflakeMutable;
  processId:        number;
  _maxIncrement:    number;
  _lock():          void;
  _unlock():        void;
  generate():       Snowflake;
  _generate():      Snowflake;
  _generateAsync(): Snowflake;
}
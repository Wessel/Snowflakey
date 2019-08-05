export const Master = require('./Snowflake/Master').default;
export const Worker = require('./Snowflake/Worker').default;
export const lookup = (flake: number, epoch: number): Date => {
  return new Date((flake / 4194304) + epoch);
};

export const Token = require('./Token/main').default;

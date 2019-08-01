export const Master = require('./Master').default;
export const Worker = require('./Worker').default;
export const lookup = (flake: number, epoch: number): string => {
  return new Date((flake / 4194304) + epoch).toLocaleString();
};


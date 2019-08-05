/**
 * Halt the event loop for `duration` seconds
 *
 * @param {number} [duration=1] - The duration in seconds to wait for
 */
export const sleep = (duration: number = 1): void => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, (duration * 1000));
};

/**
 * Get all bits from `bits`
 *
 * @param {number} bits - The bits to get bits from
 * @returns {number} - The found bits
 */
export const getBits = (bits: number): number => {
  return (2 ** bits) - 1;
};
import Base32 from './base32'
import { createHmac, randomBytes } from 'crypto'

export default class OTP {
  public seed: string;

  constructor(seed: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz!@#$-') {
    this.seed = seed;
  }

  validateHotp(token: string, secret: any, counter: any): boolean {
    const counterInt: number = parseInt(counter, 10) || 0;
    if (!secret || !token || token.length !== 6 || isNaN(parseInt(token, 10))) return false;

    return this._computeHotp(secret, counterInt) === token;
  }

  validateTotp(token: string, secret: string): boolean {
    return this.validateHotp(token, secret, Math.floor(Date.now() / 30 / 1000));
  }

  generateKey(name: string = 'Secret Key', issuer: string = null, hotp: boolean = false): object {
    const bytes: any = randomBytes(32);
    const string: string[] = Array(32)
      .fill(i => this.seed[Math.floor(bytes[i] / 255.0 * (this.seed.length - 1))])
      .map((f, i) => f(i))

    const key = {
      raw: string.join(''),
      base32: Base32.encode(string)
    }

    return Object.defineProperty(key, 'url', {
      value: 'google_url',
      writable: false,
      get: () => `otpauth://${hotp ? 'h' : 't'}otp/${name}?secret=${key.base32}${issuer ? `&issuer=${issuer}` : ''}`
    });
  }

  private _computeHotp(secret: any, counter: number): string {
    secret = Base32.decode(secret);

    let tmp: number = counter;
    const chunks: Buffer = Buffer.alloc(8);
    for (let i = 0; i < 8; i++) {
      chunks[7 - i] = tmp & 0xff;
      tmp = tmp >> 8;
    }

    const digest: Buffer = createHmac('sha1', secret).update(chunks).digest();

    const offset: number = digest[digest.length - 1] & 0xf;
    let code: number | string | number[] = (digest[offset] & 0x7f) << 24 |
      (digest[offset + 1] & 0xff) << 16 |
      (digest[offset + 2] & 0xff) << 8 |
      (digest[offset + 3] & 0xff);

    code = new Array(7).join('0') + code.toString(10);
    return code.substr(-6);
  }
}

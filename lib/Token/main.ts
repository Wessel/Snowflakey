import { createHmac } from 'crypto'
import { TokenConfig } from '../types'
import OTP from './otp'

export default class TokenGenerator {
  public EPOCH:    number;
  public secret:   string;
  public VERSION:  number;
  private _otp:    any;

  constructor(options: TokenConfig) {
    this.EPOCH =   options.epoch || 1546300800000;
    this.secret =  options.secret
    this.VERSION = options.version || 1;
    this._otp =    new OTP(options.seed || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz!@#$-');
  }

  generate(ID: string): string {
    const parts: string[] = [
      Buffer.from(ID).toString('base64'),
      Buffer.from(this.tokenTime.toString()).toString('base64')
    ];

    return `${parts.join('.').replace(/=/g, '')}.${this._computeHmac(parts.join('.').replace(/=/g, ''))}`;
  }

  upgrade(token: string, mfa: string, secret: string, counter: any = -1): string {
    if (!token.startsWith('mfa.') &&
      ((counter === -1 && this._otp.validateTotp(mfa, secret)) ||
       (counter !== -1 && this._otp.validateHotp(mfa, secret, counter)))) {
      const parts: string[] = token.split('.');

      return `mfa.${parts[0]}.${parts[1]}.${this._computeHmac(`mfa.${parts[0]}.${parts[1]}`)}`;
    }

    return null;
  }

  validate(token: string, fetcher: any): boolean {
    const isMfa: boolean = token.startsWith('mfa.');
    const partitions: string[] = token.replace(/^mfa\./, '').split('.');

    if (partitions.length !== 3) return false;

    const signatureStr: string = `${isMfa ? 'mfa.' : ''}${partitions[0]}.${partitions[1]}`;
    if (partitions[2] !== this._computeHmac(signatureStr)) return false;

    const ID: string = Buffer.from(partitions[0], 'base64').toString('utf8');
    const time: string = Buffer.from(partitions[1], 'base64').toString('utf8');
    const accountDetails: any = fetcher(ID);

    return time > accountDetails.tokensValidSince && isMfa === accountDetails.hasMfa;
  }

  get tokenTime(): number {
    return Math.floor((Date.now() - this.EPOCH) / 1000);
  }

  private _computeHmac(string: string): string {
    return createHmac('sha256', this.secret).update(`TTF.${this.VERSION}.${string}`).digest('base64').replace(/=/g, '');
  }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const otp_1 = __importDefault(require("./otp"));
class TokenGenerator {
    constructor(options) {
        this.EPOCH = options.epoch || 1546300800000;
        this.secret = options.secret;
        this.VERSION = options.version || 1;
        this._otp = new otp_1.default(options.seed || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz!@#$-');
    }
    generate(ID) {
        const parts = [
            Buffer.from(ID).toString('base64'),
            Buffer.from(this.tokenTime.toString()).toString('base64')
        ];
        return `${parts.join('.').replace(/=/g, '')}.${this._computeHmac(parts.join('.').replace(/=/g, ''))}`;
    }
    upgrade(token, mfa, secret, counter = -1) {
        if (!token.startsWith('mfa.') &&
            ((counter === -1 && this._otp.validateTotp(mfa, secret)) ||
                (counter !== -1 && this._otp.validateHotp(mfa, secret, counter)))) {
            const parts = token.split('.');
            return `mfa.${parts[0]}.${parts[1]}.${this._computeHmac(`mfa.${parts[0]}.${parts[1]}`)}`;
        }
        return null;
    }
    validate(token, fetcher) {
        const isMfa = token.startsWith('mfa.');
        const partitions = token.replace(/^mfa\./, '').split('.');
        if (partitions.length !== 3)
            return false;
        const signatureStr = `${isMfa ? 'mfa.' : ''}${partitions[0]}.${partitions[1]}`;
        if (partitions[2] !== this._computeHmac(signatureStr))
            return false;
        const ID = Buffer.from(partitions[0], 'base64').toString('utf8');
        const time = Buffer.from(partitions[1], 'base64').toString('utf8');
        const accountDetails = fetcher(ID);
        return time > accountDetails.tokensValidSince && isMfa === accountDetails.hasMfa;
    }
    get tokenTime() {
        return Math.floor((Date.now() - this.EPOCH) / 1000);
    }
    _computeHmac(string) {
        return crypto_1.createHmac('sha256', this.secret).update(`TTF.${this.VERSION}.${string}`).digest('base64').replace(/=/g, '');
    }
}
exports.default = TokenGenerator;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base32_1 = __importDefault(require("./base32"));
const crypto_1 = require("crypto");
class OTP {
    constructor(seed = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz!@#$-') {
        this.seed = seed;
    }
    validateHotp(token, secret, counter) {
        const counterInt = parseInt(counter, 10) || 0;
        if (!secret || !token || token.length !== 6 || isNaN(parseInt(token, 10)))
            return false;
        return this._computeHotp(secret, counterInt) === token;
    }
    validateTotp(token, secret) {
        return this.validateHotp(token, secret, Math.floor(Date.now() / 30 / 1000));
    }
    generateKey(name = 'Secret Key', issuer = null, hotp = false) {
        const bytes = crypto_1.randomBytes(32);
        const string = Array(32)
            .fill(i => this.seed[Math.floor(bytes[i] / 255.0 * (this.seed.length - 1))])
            .map((f, i) => f(i));
        const key = {
            raw: string.join(''),
            base32: base32_1.default.encode(string)
        };
        return Object.defineProperty(key, 'url', {
            value: 'google_url',
            writable: false,
            get: () => `otpauth://${hotp ? 'h' : 't'}otp/${name}?secret=${key.base32}${issuer ? `&issuer=${issuer}` : ''}`
        });
    }
    _computeHotp(secret, counter) {
        secret = base32_1.default.decode(secret);
        let tmp = counter;
        const chunks = Buffer.alloc(8);
        for (let i = 0; i < 8; i++) {
            chunks[7 - i] = tmp & 0xff;
            tmp = tmp >> 8;
        }
        const digest = crypto_1.createHmac('sha1', secret).update(chunks).digest();
        const offset = digest[digest.length - 1] & 0xf;
        let code = (digest[offset] & 0x7f) << 24 |
            (digest[offset + 1] & 0xff) << 16 |
            (digest[offset + 2] & 0xff) << 8 |
            (digest[offset + 3] & 0xff);
        code = new Array(7).join('0') + code.toString(10);
        return code.substr(-6);
    }
}
exports.default = OTP;

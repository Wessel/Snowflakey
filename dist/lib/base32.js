"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Base32 {
    static encode(data) {
        let encoded = '';
        let shift = 3;
        let carry = 0;
        let symbol, byte;
        for (let i = 0; i < data.length; i++) {
            byte = data[i];
            symbol = carry | (byte >> shift);
            encoded += Base32.alphabet[symbol & 0x1f];
            if (shift > 5) {
                shift -= 5;
                symbol = byte >> shift;
                encoded += Base32.alphabet[symbol & 0x1f];
            }
            shift = 5 - shift;
            carry = byte << shift;
            shift = 8 - shift;
        }
        if (shift !== 3)
            encoded += Base32.alphabet[carry & 0x1f];
        return encoded;
    }
    static decode(data) {
        Base32._charmap();
        let shift = 8;
        let carry = 0;
        const chunks = [];
        for (const char of data.toUpperCase().split('')) {
            if (char === '')
                return;
            const symbol = Base32.charmap[char] & 0xff;
            shift -= 5;
            if (shift > 0)
                carry |= symbol << shift;
            else if (shift < 0) {
                chunks.push(carry | (symbol >> -shift));
                shift += 8;
                carry = (symbol << shift) & 0xff;
            }
            else {
                chunks.push(carry | symbol);
                shift = 8;
                carry = 0;
            }
        }
        if (shift !== 8 && carry !== 0)
            chunks.push(carry);
        return Buffer.from(chunks);
    }
    static _charmap() {
        if (!Base32.charmap) {
            const mappings = { 0: 14, 1: 8 };
            const alphabet = Base32.alphabet.split('');
            for (const i in alphabet)
                if (!(alphabet[i] in mappings))
                    mappings[alphabet[i]] = i;
            Base32.charmap = mappings;
        }
    }
}
Base32.charmap = null;
Base32.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
exports.default = Base32;

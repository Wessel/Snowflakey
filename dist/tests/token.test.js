"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snowflakey_1 = require("../lib/snowflakey");
const Generator = new snowflakey_1.Token({ secret: 'VerySecretSecret1' });
const token = Generator.generate('107130754189766656');
console.log(token);

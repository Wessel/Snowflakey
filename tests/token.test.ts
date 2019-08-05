import { Token } from '../lib/snowflakey';

const Generator = new Token({ secret: 'VerySecretSecret1' });
const token = Generator.generate('107130754189766656');

console.log(token);

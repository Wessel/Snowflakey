# snowflakey
> A lightweight Node.js snowflake generator/lookup tool

> [GitHub](https://www.github.com/PassTheWessel/Snowflakey) **|** [NPM](https://www.npmjs.com/package/snowflakey)

## Installing
```sh
$ yarn add snowflakey # Install w/ Yarn
$ npm i snowflakey # Install w/ NPM
```

## Usage
##### Using a worker
```js
// Declare snowflakey
const snowflakey = require('snowflakey');
// Create the worker instance
const Worker = new snowflakey.Worker({
  name: 'starling',
  epoch: 1420070400000,
  workerId: process.env.CLUSTER_ID || 31,
  processId: process.pid || undefined,
  workerBits: 8,
  processBits: 0,
  incrementBits: 14
});

// Generate the snowflake
const flake = Worker.generate();
console.log(`Created snowflake: ${flake}`);
console.log(`Creation date    : ${snowflakey.lookup(flake, worker.options.epoch)}`);
console.log(`Deconstructed    : ${Worker.deconstruct(flake).timestamp.valueOf()}`);
```

##### Using a master
```js
// ... Worker code
// Create the master instance and add the worker
const Master = new snowflakey.Master();
master.addWorker(Worker);
// Listen to the events
master.on('newSnowflake', (data) => {
  console.log(`created snowflake: ${data.snowflake} by Worker ${data.worker.options.name || data.worker.options.workerId}`)
  console.log(`Creation date    : ${Snowflake.lookup(flake, data.worker.options.epoch)}`);
  data.worker.deconstruct(data.snowflake);
});

master.on('deconstructedFlake', (data) => {
  console.log(`Deconstructed    : ${data.timestamp.valueOf()} by Worker ${data.worker.options.name || data.worker.options.workerId}`);
});
// Make the worker generate a snowflake
worker.generate();
```
##### Result
```sh
$ node test.js
Created snowflake: 534760094454759424
Creation date    : 2019-1-15 16:45:41
Deconstructed    : 1547567141880
```

### What is a snowflake?
Snowflakes are strings that range from 14 to 19 characters long that can give every user it's unique ID. You can't get much data with just a snowflake, but you can get the creation date of the snowflake and identify every unique user with it.
```
    #--[ Example on how snowflakes work using Discord's Epoch ]--#
                        18
                        107130754189766656
                                | to binary
57                              ↓    23     18      13
[1011111001001101011011010011101000][00000][000011][000000000000]
Number of MS since Discord's Epoch  internal internal incremented for
(the first second of 2015)          worker   process  every generated ID
              | to decimal          ID       ID       on that process
              ↓
         12770981096
              | +1420070400000
              ↓ Discord Epoch (unix timestamp in ms)
        1432841381096
              | Parse unix timestamp (ms)
              ↓
  2015-05-28T19:29:41.096Z UTC
```

### What is a token?
Tokens are almost always used to access an API, tokens are (almost) always secret and only available to be viewed by the creator of the token. Snowflakey makes tokens that exist out of 3 parts: the user's ID, the current time and a Hmac hash. Below is an example on how it works

```
                        #--[ Example on how tokens work ]--#
80                          56           44
[MTA3MTMwNzU0MTg5NzY2NjU2].[MTg1MzkyNzk].[efdZism4cPVwMynra4491_c_05Hi5WuCptgWqlW5bFbY0]
The user's ID              Current time  Hmac hash (digest: Base64) that Consists
             |________ __________|       out of TTF + version + part[0] + part[1]
                      | From base64
                      ↓
         [107130754189766656].[18539279]
                  | Resolve       | * 1000 to
                  ↓ the User      ↓ convert it to ms
           Wesselgame#0498   18539279000
                                  | +1546300800000
                                  ↓ add Epoch (the first second of 2019)
                            1564840079000
                                  | Parse unix timestamp (ms)
                                  ↓
                     2019-08-03T13:47:59.000Z UTC
```

// require & generate the instance
import * as Snowflake from '../lib/snowflakey';

const master = new Snowflake.Master();
const worker = new Snowflake.Worker({
  name: 'starling',
  epoch: 1420070400000,
  workerId: process.env.CLUSTER_ID || 31,
  processId: process.pid || undefined,
  workerBits: 8,
  processBits: 0,
  incrementBits: 14
});

master.addWorkers(worker);

// Using the worker directly
const flake = worker.generate();
const epoch = 1420070400000;

console.log('----------[ Worker ]----------')
console.log(`Created snowflake: ${flake}`);
console.log(`Creation date    : ${Snowflake.lookup(flake, worker.options.epoch)}`);
console.log(`Deconstructed    : ${worker.deconstruct(flake).timestamp.valueOf()}`);
// Using the master to get events
console.log('----------[ Master ]----------')
master.on('newSnowflake', (data) => {
  console.log(`created snowflake: ${data.snowflake} by Worker ${data.worker.options.name || data.worker.options.workerId}`)
  console.log(`Creation date    : ${Snowflake.lookup(flake, data.worker.options.epoch)}`);
  data.worker.deconstruct(data.snowflake);
});

master.on('deconstructedFlake', (data) => {
  console.log(`Deconstructed    : ${data.timestamp.valueOf()} by Worker ${data.worker.options.name || data.worker.options.workerId}`);
});

worker.generate();

master.removeWorkers(worker.options.name);
console.log(master.listWorkers())
import { EventEmitter } from 'events';
import { SnowflakeWorker } from './types';

export default class SnowflakeMaster extends EventEmitter {
  public workers: any[]

  constructor() {
    super();
    this.setMaxListeners(1000);
    this.workers = [];
  }

  addWorkers(...workers: SnowflakeWorker[]): void {
    for (const worker of workers) {
      this.workers.push(worker);
    }

    return this.refresh();
  }

  listWorkers(): SnowflakeWorker[] {
    return this.workers;
  }

  removeWorkers(...identities: string[] | number[]): { 'removed': number } {
    let found = 0;

    for (const identity of identities) {
      for (let i in this.workers) {
        const worker = this.workers[i];
        if (worker.options.name === identity || worker.options.workerId === identity) {
          found++;
          this.workers.splice(parseInt(i), 1);
        }
      }
    }

    return { removed: found }
  }

  refresh(): void {
    for (let worker of this.workers) {
      worker.on('newSnowflake', (...args) => this.emit('newSnowflake', ...args));
      worker.on('deconstructedFlake', (...args) => this.emit('deconstructedFlake', ...args));
    }
  }
}


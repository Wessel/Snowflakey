"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class SnowflakeMaster extends events_1.EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(1000);
        this.workers = [];
    }
    addWorkers(...workers) {
        for (const worker of workers)
            this.workers.push(worker);
        return this.refresh();
    }
    listWorkers() {
        return this.workers;
    }
    removeWorkers(...identities) {
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
        return { removed: found };
    }
    refresh() {
        for (let worker of this.workers) {
            worker.on('newSnowflake', (...args) => this.emit('newSnowflake', ...args));
            worker.on('deconstructedFlake', (...args) => this.emit('deconstructedFlake', ...args));
        }
    }
}
exports.default = SnowflakeMaster;

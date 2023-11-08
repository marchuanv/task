import { TaskProperties } from './task-properties.mjs';
const privateBag = new WeakMap();
const maxQueueTimeMill = 1000;
const maxQueueTimeNano = (maxQueueTimeMill * 1000000);
export class TaskPromise {
    /**
     * @param { TaskProperties } properties
    */
    constructor(properties) {
        const Id = Number(process.hrtime.bigint());
        if (!privateBag.has(properties)) {
            privateBag.set(properties, []);
        }
        const promise = new Promise((resolve, reject) => {
            privateBag.set(this, {
                Id,
                properties,
                promise: null,
                isResolved: false,
                resolve,
                reject
            });
        });
        privateBag.get(this).promise = promise;
        const taskPromises = privateBag.get(properties);
        if (taskPromises.length === 0) {
            taskPromises.unshift(this);
        } else {
            const promisesMaxIndex = taskPromises.length === 0 ? 0 : (taskPromises.length - 1);
            const startTime = taskPromises[promisesMaxIndex].Id;
            const endTime = taskPromises[0].Id;
            const diff = endTime - startTime;
            if (diff > maxQueueTimeNano) {
                throw new Error(`all promises were not queued within ${maxQueueTimeMill} milliseconds`);
            }
            taskPromises.unshift(this);
        }
    }
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    /**
     * @returns { Boolean }
    */
    get isResolved() {
        const { isResolved } = privateBag.get(this);
        return isResolved;
    }
    /**
     * @param { Boolean } value
    */
    set isResolved(value) {
        const vars = privateBag.get(this);
        vars.isResolved = value;
    }
    /**
     * @returns { Promise }
    */
    get() {
        const { promise } = privateBag.get(this);
        return promise;
    }
    /**
     * @param { Object } data
    */
    resolve(data) {
        setTimeout(() => {
            if (this.isResolved) {
                return;
            }
            const vars = privateBag.get(this);
            const { properties } = vars;
            let taskPromises = privateBag.get(properties);
            const dequeued = taskPromises.shift();
            if (dequeued.Id === this.Id) {
                if (!properties.data || JSON.stringify(properties.data) === '{}') {
                    properties.data = data;
                }
                this.isResolved = true;
                return vars.resolve(properties.data);
            } else {
                taskPromises.push(dequeued);
            }
            this.isResolved = false;
            this.resolve.call(this, data);
        }, maxQueueTimeMill);
    }
    reject() {
        setTimeout(() => {
            const vars = privateBag.get(this);
            const taskPromises = privateBag.get(vars.properties);
            if (taskPromises.isLocked) {
                return this.reject.call(this);
            }
            const filteredPromises = taskPromises.promises.filter(x => x.Id !== this.Id);
            for (const taskPromise of filteredPromises) {
                taskPromise.reject(vars.properties.error);
            }
            vars.reject(vars.properties.error);
        }, 100);
    }
}
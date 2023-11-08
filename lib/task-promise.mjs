import { TaskProperties } from './task-properties.mjs';
const privateBag = new WeakMap();
const maxQueueTimeMill = 1000;
const maxQueueTimeNano = (maxQueueTimeMill * 1000000);
let counter = 0;
export class TaskPromise {
    /**
     * @param { TaskProperties } properties
    */
    constructor(properties) {
        counter = counter + 1;
        const Id = Number(process.hrtime.bigint());
        if (!privateBag.has(properties)) {
            privateBag.set(properties, []);
        }
        const promise = new Promise((resolve, reject) => {
            privateBag.set(this, {
                Id,
                name: `TaskPromise${counter}`,
                lock: false,
                properties,
                promise: null,
                isResolved: false,
                data: null,
                resolve,
                reject
            });
        });
        privateBag.get(this).promise = promise;
        let taskPromises = privateBag.get(properties);
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
    /**
     * @returns { Number }
    */
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    /**
     * @returns { String }
    */
    get name() {
        const { name } = privateBag.get(this);
        return name;
    }
    /**
     * @returns { Object }
    */
    get data() {
        const { data } = privateBag.get(this);
        return data;
    }
    /**
     * @param { Object } value
    */
    set data(value) {
        const vars = privateBag.get(this);
        vars.data = value;
    }
    /**
     * @returns { Boolean }
    */
    get lock() {
        const { lock } = privateBag.get(this);
        return lock;
    }
    /**
     * @param { Boolean }
    */
    set lock(value) {
        const vars = privateBag.get(this);
        vars.lock = value;
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
        if (!this.data) {
            this.data = data;
        }
        setTimeout.call(this, () => {
            resolveAll.call(this);
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

function resolveAll() {
    if (this.isResolved) {
        return;
    }
    const vars = privateBag.get(this);
    const { properties } = vars;
    const taskPromises = privateBag.get(properties);
    const unresolvedTaskPromiseIds = taskPromises.filter(x => !x.isResolved).map(x => x.Id);
    const highestPriorityId = Math.max(...unresolvedTaskPromiseIds);
    const nextTaskPromise = taskPromises.find(x => x.Id === highestPriorityId);
    if (nextTaskPromise.Id === this.Id) {
        if (!properties.data || JSON.stringify(properties.data) === '{}') {
            properties.data = this.data;
        }
        this.isResolved = true;
        return vars.resolve(properties.data);
    }
    setImmediate(() => {
        resolveAll.call(this);
    });
}
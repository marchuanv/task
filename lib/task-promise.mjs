import crypto from 'node:crypto';
import { TaskProperties } from './task-properties.mjs';
const privateBag = new WeakMap();
export class TaskPromise {
    /**
     * @param { TaskProperties } properties
    */
    constructor(properties) {
        const priority = Number(process.hrtime.bigint());
        if (!privateBag.has(properties)) {
            privateBag.set(properties, []);
        }
        const promises = privateBag.get(properties);
        promises.push(this);
        const promise = new Promise((resolve, reject) => {
            privateBag.set(this, {
                Id: crypto.randomUUID(),
                properties,
                priority,
                promise: null,
                isResolved: false,
                resolve,
                reject
            });
        });
        privateBag.get(this).promise = promise;
    }
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    /**
     * @returns { Number }
     */
    get priority() {
        const { priority } = privateBag.get(this);
        return priority;
    }
    /**
     * @param { Number } value
    */
    set priority(value) {
        const vars = privateBag.get(this);
        vars.priority = value;
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
    resolve(data) {
        setTimeout(() => {
            if (this.isResolved) {
                return;
            }
            const vars = privateBag.get(this);
            let taskPromises = privateBag.get(vars.properties);
            taskPromises = taskPromises.sort((tp1, tp2) => {
                if (tp1.priority > tp2.priority) {
                    return -1;
                } else {
                    return 1;
                }
            });
            const topTaskPromiseId = taskPromises[0].Id;
            if (topTaskPromiseId === this.Id) {
                taskPromises.shift();
                this.isResolved = true;
                vars.resolve(data);
            } else {
                this.isResolved = false;
                this.resolve.call(this, data);
            }
        }, 100);
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
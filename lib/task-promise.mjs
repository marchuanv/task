import crypto from 'node:crypto';
import { TaskProperties } from './task-properties.mjs';
const privateBag = new WeakMap();
export class TaskPromise {
    /**
     * @param { TaskProperties } properties
    */
    constructor(properties) {
        if (!privateBag.has(properties)) {
            privateBag.set(properties, []);
        }
        const promises = privateBag.get(properties);
        promises.push(this);
        const priority = promises.length;
        const promise = new Promise((resolve, reject) => {
            privateBag.set(this, {
                Id: crypto.randomUUID(),
                priority,
                properties,
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
    resolve() {
        if (this.isResolved) {
            return;
        }
        setTimeout(() => {
            const vars = privateBag.get(this);
            const taskPromises = privateBag.get(vars.properties);
            if (taskPromises.find(tp => tp.priority > this.priority && !tp.isResolved)) {
                const resolvedPromiseResolvedCount = taskPromises.filter(tp => tp.isResolved).length;
                console.log(resolvedPromiseResolvedCount);
                if (resolvedPromiseResolvedCount === (taskPromises.length - 1)) {
                    console.log();
                } else {
                    return this.resolve.call(this);
                }
            }
            if (taskPromises.find(tp => tp.Id === this.Id)) {
                vars.resolve(vars.properties.data);
                this.isResolved = true;
            } else {
                throw new Error('Critical Error');
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
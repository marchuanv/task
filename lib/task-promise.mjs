import { TaskProperties } from './task-properties.mjs';
const privateBag = new WeakMap();
export class TaskPromise {
    /**
     * @param { TaskProperties } properties
    */
    constructor(properties) {
        if (privateBag.has(properties)) {
            const taskPromises = privateBag.get(properties);
            taskPromises.promises.push(this);
        } else {
            privateBag.set(properties, {
                isLocked: false,
                promises: [this]
            });
        }
        const promise = new Promise((resolve, reject) => {
            privateBag.set(this, {
                properties,
                promise: null,
                resolve,
                reject
            });
        });
        privateBag.get(this).promise = promise;
    }
    /**
     * @returns { Promise }
    */
    get() {
        const { promise } = privateBag.get(this);
        return promise;
    }
    resolve() {
        setTimeout(() => {
            const vars = privateBag.get(this);
            const taskPromises = privateBag.get(vars.properties);
            const { isLocked, promises } = taskPromises;
            if (isLocked) {
                return this.resolve.call(this);
            }
            for (const taskPromise of promises) {
                taskPromise.resolve(vars.properties.data);
            }
            vars.resolve(vars.properties.data);
        }, 100);
    }
    reject() {
        setTimeout(() => {
            const vars = privateBag.get(this);
            const taskPromises = privateBag.get(vars.properties);
            const { isLocked, promises } = taskPromises;
            if (isLocked) {
                return this.reject.call(this);
            }
            for (const taskPromise of promises) {
                taskPromise.reject(vars.properties.error);
            }
            vars.reject(vars.properties.error);
        }, 100);
    }
}
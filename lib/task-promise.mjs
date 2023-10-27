import { TaskProperties } from './task-properties.mjs';
const privateBag = new WeakMap();
export class TaskPromise {
    /**
     * @param { TaskProperties } properties
     */
    constructor(properties) {
        const promise = new Promise((resolve, reject) => {
            privateBag.set(this, { properties, promise: null, resolve, reject });
        });
        privateBag.get(this).promise = promise;
        if (privateBag.has(properties)) {
            const root = privateBag.get(properties);
            root.children.push({ parent: root, promise: this, children: [] });
        } else {
            privateBag.set(properties, { parent: null, promise: this, children: [] });
        }
    }
    /**
     * @returns { Promise }
     */
    get() {
        const { promise } = privateBag.get(this);
        return promise;
    }
    resolve() {
        const { properties, resolve } = privateBag.get(this);
        const root = privateBag.get(properties);
        for (const { promise } of root.children) {
            promise.resolve();
        }
        resolve(properties.data);
    }
    reject() {
        const { properties, reject } = privateBag.get(this);
        const root = privateBag.get(properties);
        for (const { promise } of root.children) {
            promise.reject();
        }
        reject(properties.data);
    }
}
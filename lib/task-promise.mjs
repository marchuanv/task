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
                isRejected: false,
                data: null,
                isHandledPromise: false,
                error: null,
                resolve,
                reject
            });
        });
        privateBag.get(this).promise = promise;
        let taskPromises = privateBag.get(properties);
        taskPromises.unshift(this);
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
     * @returns { Error }
    */
    get error() {
        const { error } = privateBag.get(this);
        return error;
    }
    /**
     * @param { Error } value
    */
    set error(value) {
        const vars = privateBag.get(this);
        vars.error = value;
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
    * @returns { Boolean }
   */
    get isRejected() {
        const { isRejected } = privateBag.get(this);
        return isRejected;
    }
    /**
     * @param { Boolean } value
    */
    set isRejected(value) {
        const vars = privateBag.get(this);
        vars.isRejected = value;
    }
    /**
     * @returns { Promise }
    */
    get() {
        const vars = privateBag.get(this);
        const { promise } = vars;
        vars.isHandledPromise = true;
        return promise;
    }
    /**
     * @returns { Boolean }
    */
    get isHandledPromise() {
        const { isHandledPromise } = privateBag.get(this);
        return isHandledPromise;
    }
    /**
     * @param { Boolean } value
    */
    set isHandledPromise(value) {
        const vars = privateBag.get(this);
        vars.isHandledPromise = value;
    }
    /**
     * @param { Object } data
    */
    resolve(data) {
        if (!this.data && data) {
            this.data = data;
        }
        setTimeout.call(this, () => {
            const vars = privateBag.get(this);
            const { properties, resolve, reject } = vars;
            const taskPromises = privateBag.get(properties);
            const startTime = Math.min(...taskPromises.map(x => x.Id));
            const endTime = Math.max(...taskPromises.map(x => x.Id));
            const diff = endTime - startTime;
            const isPromiseQueueValid = diff <= maxQueueTimeNano;
            resolveAll.call(this, taskPromises, properties, isPromiseQueueValid, resolve, reject);
        }, maxQueueTimeMill);
    }
    reject(error) {
        if (!this.error && error) {
            this.error = error;
        }
        setTimeout.call(this, () => {
            const vars = privateBag.get(this);
            const { properties, resolve, reject } = vars;
            const taskPromises = privateBag.get(properties);
            const startTime = Math.min(...taskPromises.map(x => x.Id));
            const endTime = Math.max(...taskPromises.map(x => x.Id));
            const diff = endTime - startTime;
            const isPromiseQueueValid = diff <= maxQueueTimeNano;
            rejectAll.call(this, taskPromises, properties, isPromiseQueueValid, resolve, reject);
        }, maxQueueTimeMill);
    }
}
/**
* @param { Array<TaskPromise> } taskPromises
* @param { TaskProperties } taskProperties
* @param { Boolean } isPromiseQueueValid
* @param { Function } resolve
* @param { Function } reject
*/
function resolveAll(taskPromises, taskProperties, isPromiseQueueValid, resolve, reject) {
    const unresolvedTaskPromiseIds = taskPromises.filter(x => !x.isResolved && !x.isRejected).map(x => x.Id);
    if (unresolvedTaskPromiseIds.length === 0) {
        return;
    }
    const highestPriorityId = Math.max(...unresolvedTaskPromiseIds);
    const nextTaskPromise = taskPromises.find(x => x.Id === highestPriorityId);
    if (nextTaskPromise.Id === this.Id) {
        if (!this.isHandledPromise) {
            this.get().then(() => {
            }).catch((error) => {
                console.error(error);
            });
        }
        if (isPromiseQueueValid) {
            if (!taskProperties.data || JSON.stringify(taskProperties.data) === '{}') {
                taskProperties.data = this.data;
            }
            this.isResolved = true;
            resolve(taskProperties.data);
        } else {
            this.isRejected = true;
            reject(new Error(`all task promises for a single task must be queued within ${maxQueueTimeMill} milliseconds`));
        }
        return;
    }
    setImmediate(() => {
        resolveAll.call(this,
            taskPromises,
            taskProperties,
            isPromiseQueueValid,
            resolve,
            reject
        );
    });
}
/**
* @param { Array<TaskPromise> } taskPromises
* @param { TaskProperties } taskProperties
* @param { Boolean } isPromiseQueueValid
* @param { Function } resolve
* @param { Function } reject
*/
function rejectAll(taskPromises, taskProperties, isPromiseQueueValid, resolve, reject) {
    const unresolvedTaskPromiseIds = taskPromises.filter(x => !x.isResolved && !x.isRejected).map(x => x.Id);
    if (unresolvedTaskPromiseIds.length === 0) {
        return;
    }
    const highestPriorityId = Math.max(...unresolvedTaskPromiseIds);
    const nextTaskPromise = taskPromises.find(x => x.Id === highestPriorityId);
    if (nextTaskPromise.Id === this.Id) {
        this.isRejected = true;
        if (!this.isHandledPromise) {
            this.get().then(() => {
            }).catch((error) => {
                console.error(error);
            });
        }
        if (isPromiseQueueValid && !taskProperties.error) {
            taskProperties.error = this.error;
        }
        reject(taskProperties.error);
        return;
    }
    setImmediate(() => {
        rejectAll.call(this,
            taskPromises,
            taskProperties,
            isPromiseQueueValid,
            resolve,
            reject
        );
    });
}
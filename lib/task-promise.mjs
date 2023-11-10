import {
    Task,
    TaskContainer
} from "./registry.mjs";

const maxQueueTimeMill = 1000;
const maxQueueTimeNano = (maxQueueTimeMill * 1000000);
export class TaskPromise extends TaskContainer {
    /**
     * @param { Task } task
    */
    constructor(task) {
        super(task);
        super.Id = Number(process.hrtime.bigint());
        super.data = null;
        super.error = null;
        super.promise = new Promise((resolve, reject) => {
            super.resolve = resolve;
            super.reject = reject;
        });
        super.promises.unshift(this)
        Object.seal(this);
    }
    /**
     * @returns { Number }
    */
    get Id() {
        return super.Id;
    }
    /**
     * @returns { Promise }
    */
    get() {
        super.isHandledPromise = true;
        return super.promise;
    }
    /**
     * @param { Object } data
    */
    resolve(data) {
        super.data = data;
        setTimeout.call(this, () => {
            const taskPromises = super.promises;
            super.startTime = Math.min(...taskPromises.map(x => x.Id));
            super.endTime = Math.max(...taskPromises.map(x => x.Id));
            const diff = super.endTime - super.startTime;
            const isPromiseQueueValid = diff <= maxQueueTimeNano;
            resolveAll.call(this, isPromiseQueueValid);
        }, maxQueueTimeMill);
    }
    reject(error) {
        this.error = error;
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
 * @returns { Array<Number> }
 */
function getUnresolvedPromiseIds() {
    const unresolvedTaskPromiseIds = this.promises.filter(x => !x.isResolved && !x.isRejected).map(x => x.Id);
    if (unresolvedTaskPromiseIds.length === 0) {
        return null;
    }
    return unresolvedTaskPromiseIds;
}

/**
 * @returns { Array<Number> }
 */
function getResolvedPromiseIds() {
    const resolvedTaskPromiseIds = this.promises.filter(x => x.isResolved || x.isRejected).map(x => x.Id);
    if (resolvedTaskPromiseIds.length === 0) {
        return null;
    }
    return resolvedTaskPromiseIds;
}

/**
 * @returns { TaskPromise }
 */
function getNextTaskPromise() {
    const unresolvedTaskPromiseIds = getUnresolvedPromiseIds.call(this);
    if (unresolvedTaskPromiseIds === null) {
        return null;
    }
    const highestPriorityId = Math.max(...unresolvedTaskPromiseIds);
    return this.promises.find(x => x.Id === highestPriorityId);
}

/**
 * @returns { TaskPromise }
 */
function getLatestPromise() {
    const resolvedTaskPromiseIds = getResolvedPromiseIds.call(this);
    if (resolvedTaskPromiseIds === null) {
        return null;
    }
    const latestPromiseId = Math.max(...resolvedTaskPromiseIds);
    return this.promises.find(x => x.Id === latestPromiseId);
}

/**
* @param { Boolean } isPromiseQueueValid
*/
function resolveAll(isPromiseQueueValid) {
    const nextTaskPromise = getNextTaskPromise.call(this);
    const latestTaskPromise = getLatestPromise.call(this);
    if (nextTaskPromise === null) {
        return;
    }
    if (nextTaskPromise.Id === this.Id) {
        if (!this.isHandledPromise) {
            this.get().then(() => {
            }).catch((error) => {
                console.error(error);
            });
        }
        if (isPromiseQueueValid) {
            if (latestTaskPromise) {
                this.data = latestTaskPromise.data;
                if (!this.data || JSON.stringify(this.data) === '{}') {
                    this.isRejected = true;
                    reject(new Error(`the last task promise did not have any data`));
                    return;
                }
                this.isResolved = true;
                resolve(this.data);
            } else {
                this.data.isRejected = true;
                reject(new Error(`critical error`));
            }
        } else {
            this.data.isRejected = true;
            reject(new Error(`all task promises for a single task must be queued within ${maxQueueTimeMill} milliseconds`));
        }
        return;
    }
    setImmediate(() => {
        resolveAll.call(this, isPromiseQueueValid);
    });
}
/**
* @param { Boolean } isPromiseQueueValid
*/
function rejectAll(isPromiseQueueValid) {
    const nextTaskPromise = getNextTaskPromise.call(this);
    if (nextTaskPromise === null) {
        return;
    }
    if (nextTaskPromise.Id === this.data.Id) {
        this.data.isRejected = true;
        if (!this.data.isHandledPromise) {
            this.get().then(() => {
            }).catch((error) => {
                console.error(error);
            });
        }
        if (isPromiseQueueValid && !this.data.taskProperties.error) {
            this.data.taskProperties.error = this.error;
        }
        reject(this.data.taskProperties.error);
        return;
    }
    setImmediate(() => {
        rejectAll.call(this, isPromiseQueueValid);
    });
}
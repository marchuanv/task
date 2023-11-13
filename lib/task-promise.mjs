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
            super.startTime = Math.min(...super.promises.map(x => x.Id));
            super.endTime = Math.max(...super.promises.map(x => x.Id));
            const diff = super.endTime - super.startTime;
            const isPromiseQueueValid = diff <= maxQueueTimeNano;
            resolveAll.call(this, isPromiseQueueValid, { resolve: super.resolve, reject: super.reject });
        }, maxQueueTimeMill);
    }
    reject(error) {
        this.error = error;
        setTimeout.call(this, () => {
            const startTime = Math.min(...super.promises.map(x => x.Id));
            const endTime = Math.max(...super.promises.map(x => x.Id));
            const diff = endTime - startTime;
            const isPromiseQueueValid = diff <= maxQueueTimeNano;
            rejectAll.call(this, isPromiseQueueValid, { resolve: super.resolve, reject: super.reject });
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
function getLatestResolvedPromise() {
    const resolvedTaskPromiseIds = getResolvedPromiseIds.call(this);
    if (resolvedTaskPromiseIds === null) {
        return null;
    }
    const latestPromiseId = Math.max(...resolvedTaskPromiseIds);
    return this.promises.find(x => x.Id === latestPromiseId);
}

/**
 * @param { Boolean } isPromiseQueueValid
 * @param { { resolve:Function, reject: Function } } promise
*/
function resolveAll(isPromiseQueueValid, promise) {
    const nextTaskPromise = getNextTaskPromise.call(this);
    let latestResolvedTaskPromise = getLatestResolvedPromise.call(this);
    if (this.promises.length === 1) {
        latestResolvedTaskPromise = nextTaskPromise;
    }
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
            if (latestResolvedTaskPromise) {
                this.data = latestResolvedTaskPromise.data;
                if (!this.data || JSON.stringify(this.data) === '{}') {
                    this.isRejected = true;
                    promise.reject(new Error(`the lastest task promise did not have any data`));
                    return;
                }
                this.isResolved = true;
                promise.resolve(this.data);
            } else {
                this.isRejected = true;
                promise.reject(new Error(`critical error`));
            }
        } else {
            this.isRejected = true;
            promise.reject(new Error(`all task promises for a single task must be queued within ${maxQueueTimeMill} milliseconds`));
        }
        return;
    }
    setImmediate(() => {
        resolveAll.call(this, isPromiseQueueValid, promise);
    });
}
/**
* @param { Boolean } isPromiseQueueValid
* @param { { resolve:Function, reject: Function } } promise
*/
function rejectAll(isPromiseQueueValid, promise) {
    const nextTaskPromise = getNextTaskPromise.call(this);
    if (nextTaskPromise === null) {
        return;
    }
    if (nextTaskPromise.Id === this.Id) {
        this.isRejected = true;
        if (!this.isHandledPromise) {
            this.get().then(() => {
            }).catch((error) => {
                console.error(error);
            });
        }
        if (isPromiseQueueValid && !this.error) {
            this.error = this.error;
        }
        promise.reject(this.error);
        return;
    }
    setImmediate(() => {
        rejectAll.call(this, isPromiseQueueValid, promise);
    });
}
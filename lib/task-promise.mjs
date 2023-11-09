import { Task } from '../task.mjs';
import { TaskContainer } from './task-container.mjs';

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
        if (!super.data && data) {
            super.data = data;
        }
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
 * @returns { Array<Number> }
 */
function getUnresolvedPromiseIds() {
    const unresolvedTaskPromiseIds = super.promises.filter(x => !x.isResolved && !x.isRejected).map(x => x.Id);
    if (unresolvedTaskPromiseIds.length === 0) {
        return null;
    }
    return unresolvedTaskPromiseIds;
}

/**
 * @returns { Array<TaskPromise> }
 */
function getNextTaskPromise() {
    const unresolvedTaskPromiseIds = getUnresolvedPromiseIds.call(this);
    if (unresolvedTaskPromiseIds === null) {
        return null;
    }
    const highestPriorityId = Math.max(...unresolvedTaskPromiseIds);
    return super.promises.find(x => x.Id === highestPriorityId);
}

/**
* @param { Boolean } isPromiseQueueValid
*/
function resolveAll(isPromiseQueueValid) {
    const nextTaskPromise = getNextTaskPromise.call(this);
    if (nextTaskPromise === null) {
        return;
    }
    if (nextTaskPromise.Id === super.Id) {
        if (!super.isHandledPromise) {
            this.get().then(() => {
            }).catch((error) => {
                console.error(error);
            });
        }
        if (isPromiseQueueValid) {
            if (!super.taskProperties.data || JSON.stringify(super.taskProperties.data) === '{}') {
                super.taskProperties.data = super.data;
            }
            super.isResolved = true;
            resolve(super.taskProperties.data);
        } else {
            super.isRejected = true;
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
    if (nextTaskPromise.Id === super.Id) {
        super.isRejected = true;
        if (!super.isHandledPromise) {
            this.get().then(() => {
            }).catch((error) => {
                console.error(error);
            });
        }
        if (isPromiseQueueValid && !super.taskProperties.error) {
            super.taskProperties.error = this.error;
        }
        reject(super.taskProperties.error);
        return;
    }
    setImmediate(() => {
        rejectAll.call(this, isPromiseQueueValid);
    });
}
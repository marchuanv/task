import crypto from 'node:crypto';
export class TaskState {
    /**
     * @param { String } Id
     */
    constructor(Id) {
        this.Id = Id;
    }
    toString() {
        return this.constructor.name;
    }
    static get Queued() {
        return queued;
    }
    static get Requeue() {
        return requeue;
    }
    static get Error() {
        return error;
    }
    static get Done() {
        return done;
    }
    static get Ready() {
        return ready;
    }
    static get Callback() {
        return callback;
    }
    static get LongRunning() {
        return longRunning;
    }
    static get PromiseResolvedWithData() {
        return promiseResolvedWithData;
    }
    /**
     * @returns { PromiseResolvedNoData }
     */
    static get PromiseResolvedNoData() {
        return promiseResolvedNoData;
    }
    /**
     * @returns { WaitForPromiseResolve }
    */
    static get WaitForPromiseResolve() {
        return waitForPromiseResolve;
    }
    static get Created() {
        return created;
    }
}
class QueuedTaskState extends TaskState { constructor() { super(crypto.randomUUID()); } }
class RequeuedTaskState extends TaskState { constructor() { super(crypto.randomUUID()); } }
class ErrorTaskState extends TaskState { constructor() { super(crypto.randomUUID()); } }
class DoneTaskState extends TaskState { constructor() { super(crypto.randomUUID()); } }
class ReadyTaskState extends TaskState { constructor() { super(crypto.randomUUID()); } }
class PromiseResolvedWithData extends TaskState { constructor() { super(crypto.randomUUID()); } }
class PromiseResolvedNoData extends TaskState { constructor() { super(crypto.randomUUID()); } }
class Callback extends TaskState { constructor() { super(crypto.randomUUID()); } }
class LongRunning extends TaskState { constructor() { super(crypto.randomUUID()); } }
class Created extends TaskState { constructor() { super(crypto.randomUUID()); } }
class WaitForPromiseResolve extends TaskState { constructor() { super(crypto.randomUUID()); } }

const queued = new QueuedTaskState();
const error = new ErrorTaskState();
const done = new DoneTaskState();
const ready = new ReadyTaskState();
const callback = new Callback();
const longRunning = new LongRunning();
const promiseResolvedWithData = new PromiseResolvedWithData();
const promiseResolvedNoData = new PromiseResolvedNoData();
const created = new Created();
const requeue = new RequeuedTaskState();
const waitForPromiseResolve = new WaitForPromiseResolve();
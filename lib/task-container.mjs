import {
    Bag,
    HighPriorityTaskQueue,
    MediumPriorityTaskQueue,
    Task,
    TaskCallbackState,
    TaskCreatedState,
    TaskPromise,
    TaskQueue,
    TaskQueuedState,
    TaskRequeueState,
    TaskRunner,
    TaskStateStack,
    TaskWaitForPromiseState,
    crypto,
    getBag
} from "./registry.mjs";

const globalBag = new Bag();

export class TaskContainer extends Bag {
    /**
     * @param { Task } task
     */
    constructor(task) {
        super();
        if (this instanceof Task) {
            throw new Error(`${Task.name} can't extend ${TaskContainer.name}`);
        }
        const _bag = getBag(task);
        _bag.Id = crypto.randomUUID();
        if (this instanceof TaskQueue) {
            _bag.taskQueue = this;
        }
        if (this instanceof TaskStateStack) {
            _bag.taskStateStack = this;
        }
        if (this instanceof TaskCallbackState) {
            _bag.taskCallbackState = this;
        }
        if (this instanceof TaskCreatedState) {
            _bag.taskCreatedState = this;
        }
        if (this instanceof TaskQueuedState) {
            _bag.taskQueuedState = this;
        }
        if (this instanceof TaskRequeueState) {
            _bag.taskRequeueState = this;
        }
        if (this instanceof TaskWaitForPromiseState) {
            _bag.taskWaitForPromiseState = this;
        }
        if (this instanceof TaskPromise) {
            _bag.taskPromise = this;
        }
        if (this instanceof TaskRunner) {
            _bag.taskRunner = this;
        }
        if (this instanceof HighPriorityTaskQueue) {
            _bag.highPriorityTaskQueue = this;
        }
        if (this instanceof MediumPriorityTaskQueue) {
            _bag.mediumPriorityTaskQueue = this;
        }
        _bag.queue = globalBag.queue;
        _bag.queueLock = globalBag.queueLock;
        _bag.task = task;
        super.sync(_bag);
        Object.seal(this);
    }
}
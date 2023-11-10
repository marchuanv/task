import {
    Bag,
    HighPriorityTaskQueue,
    MediumPriorityTaskQueue,
    Task,
    TaskCallbackState,
    TaskCreatedState,
    TaskPromise,
    TaskQueue,
    TaskReadyState,
    TaskRequeueState,
    TaskRunner,
    TaskStateStack,
    TaskWaitForPromiseState,
    getBag
} from "./registry.mjs";

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
        if (this instanceof TaskReadyState) {
            _bag.taskReadyState = this;
        }
        if (this instanceof TaskRequeueState) {
            _bag.taskRequeueState = this;
        }
        if (this instanceof TaskWaitForPromiseState) {
            _bag.taskWaitForPromiseState = this;
        }
        if (this instanceof TaskPromise) {
            _bag.taskPromises.unshift(this);
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
        _bag.task = task;
        super.sync(_bag);
        Object.seal(this);
    }
}
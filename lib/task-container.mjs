import { Task } from "../task.mjs";
import { Bag } from "./bag.mjs";
import { TaskPromise } from "./task-promise.mjs";
import { TaskProperties } from "./task-properties.mjs";
import { TaskQueue } from "./task-queue.mjs";
import { HighPriorityTaskQueue } from "./task-queues/high-priority-task-queue.mjs";
import { LowPriorityTaskQueue } from "./task-queues/low-priority-task-queue.mjs";
import { MediumPriorityTaskQueue } from "./task-queues/medium-priority-task-queue.mjs";
import { TaskRunner } from "./task-runner.mjs";
import { TaskStateStack } from "./task-state-stack.mjs";
import { TaskState } from "./task-state.mjs";
import { TaskCallbackState } from "./task-states/task-callback-state.mjs";
import { TaskCreatedState } from "./task-states/task-created-state.mjs";
import { TaskReadyState } from "./task-states/task-ready-state.mjs";
import { TaskRequeueState } from "./task-states/task-requeue-state.mjs";
import { TaskWaitForPromiseState } from "./task-states/task-waitforpromise-state.mjs";
const container = new WeakMap();
container.set(Bag, new Bag());

/**
 * @param { Object } context
 * @returns { Bag }
*/
function getBag(context) {
    if (!container.has(context)) {
        container.set(context, new Bag());
    }
    return container.get(context);
}

export class TaskContainer extends Bag {
    /**
     * @param { Task } task
     */
    constructor(task) {
        if (this instanceof Task) {
            throw new Error(`${Task.name} can't extend ${TaskContainer.name}`);
        }
        const _bag = getBag(task);
        if (this instanceof TaskProperties) {
            _bag.taskProperties = this;
        }
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
        if (this instanceof LowPriorityTaskQueue) {
            _bag.lowPriorityTaskQueue = this;
        }
        _bag.taskState = new TaskState(this);
        _bag.task = task;
        super.sync(_bag);
        Object.seal(this);
    }
}
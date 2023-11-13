export { Task } from "../task.mjs";
export { Bag } from "./bag.mjs";
export { TaskMoveStateError } from "./errors/task-move-state-error.mjs";
export { TaskTimeoutError } from "./errors/task-timeout-error.mjs";
export { TaskUnknownStateError } from "./errors/task-unknown-state-error.mjs";
export { TaskWrongStateError } from "./errors/task-wrong-state-error.mjs";
export { TaskWrongStateHistoryError } from "./errors/task-wrong-state-history-error.mjs";
export { TaskContainer } from './task-container.mjs';
export { TaskFlagGroup } from "./task-flag-group.mjs";
export { TaskFlag } from "./task-flag.mjs";
export { TaskPromise } from "./task-promise.mjs";
export { TaskQueue } from "./task-queue.mjs";
export { HighPriorityTaskQueue } from "./task-queues/high-priority-task-queue.mjs";
export { LowPriorityTaskQueue } from "./task-queues/low-priority-task-queue.mjs";
export { MediumPriorityTaskQueue } from "./task-queues/medium-priority-task-queue.mjs";
export { TaskRunner } from "./task-runner.mjs";
export { TaskStateStack } from "./task-state-stack.mjs";
export { TaskState } from "./task-state.mjs";
export { TaskCallbackState } from "./task-states/task-callback-state.mjs";
export { TaskCompletedState } from "./task-states/task-completed-state.mjs";
export { TaskCreatedState } from "./task-states/task-created-state.mjs";
export { TaskQueuedState } from "./task-states/task-queued-state.mjs";
export { TaskRequeueState } from "./task-states/task-requeue-state.mjs";
export { TaskWaitForPromiseState } from "./task-states/task-waitforpromise-state.mjs";

import crypto from 'node:crypto';

export { crypto };

import { Bag } from "./bag.mjs";

const container = new WeakMap();
container.set(Bag, new Bag());

/**
 * @param { Object } context
 * @returns { Bag }
*/
export function getBag(context) {
    if (!container.has(context)) {
        container.set(context, new Bag());
    }
    return container.get(context);
}

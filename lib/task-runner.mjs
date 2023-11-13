import {
    Task,
    TaskCallbackState,
    TaskCompletedState,
    TaskContainer,
    TaskCreatedState,
    TaskFlag,
    TaskQueuedState,
    TaskRequeueState,
    TaskTimeoutError,
    TaskUnknownStateError,
    TaskWaitForPromiseState
} from "./registry.mjs";

export class TaskRunner extends TaskContainer {
    /**
     * @param { Task } task
    */
    constructor(task) {
        super(task);
        this._run = () => {
            setImmediate(async () => {
                const taskPromise = super.taskPromise;
                const taskState = super.taskState;
                let success = false;
                try {
                    if (super.isTimeout) {
                        throw new TaskTimeoutError(super.task);
                    }
                    success = await taskState.handleTopOfStack();
                    if (super.isTimeout) {
                        success = false;
                        throw new TaskTimeoutError(super.task);
                    }
                } catch (error) {
                    super.error = error;
                }
                let nextState = false;
                if (success) {
                    super.taskStateStack.shift();
                    switch (taskState.currentState) {
                        case TaskCreatedState: {
                            nextState = true;
                            break;
                        }
                        case TaskQueuedState: {
                            nextState = true;
                            break;
                        }
                        case TaskCallbackState: {
                            if (super.task.hasFlag(TaskFlag.RepeatNoOutput)) {
                                new TaskRequeueState(super.task);
                                nextState = true;
                            } else if (super.task.hasFlag(TaskFlag.OnceOffNoOutput)) {
                                new TaskCompletedState(super.task);
                                nextState = true;
                            } else if (super.data) {
                                if (super.task.hasFlag(TaskFlag.RepeatWithOutput)) {
                                    new TaskRequeueState(super.task);
                                    nextState = true;
                                } else if (super.task.hasFlag(TaskFlag.OnceOffWithOutput)) {
                                    new TaskCompletedState(super.task);
                                    nextState = true;
                                } else {
                                    super.error = `${task.name}(${task.Id}) task has unknown flag`;
                                }
                            } else {
                                new TaskWaitForPromiseState(super.task);
                                nextState = true;
                            }
                            break;
                        }
                        case TaskWaitForPromiseState: {
                            if (super.data) {
                                if (super.task.hasFlag(TaskFlag.RepeatWithOutput)) {
                                    new TaskRequeueState(super.state);
                                    nextState = true;
                                } else if (super.task.hasFlag(TaskFlag.OnceOffWithOutput)) {
                                    new TaskCompletedState(super.state);
                                    nextState = true;
                                } else if (super.task.hasFlag(TaskFlag.RepeatNoOutput)) {
                                    super.error = `${task.name}(${task.Id}) task with ${TaskFlag.RepeatNoOutput.toString()} flag should not be handled by ${TaskWaitForPromiseState.name}`;
                                } else if (super.task.hasFlag(TaskFlag.OnceOffNoOutput)) {
                                    super.error = `${task.name}(${task.Id}) task with ${TaskFlag.OnceOffNoOutput.toString()} flag should not be handled by ${TaskWaitForPromiseState.name}`;
                                } else {
                                    super.error = `${task.name}(${task.Id}) task has unknown flag`;
                                }
                            } else {
                                if (super.task.hasFlag(TaskFlag.RepeatWithOutput)) {
                                    super.error = `${task.name}(${task.Id}) task with ${TaskFlag.RepeatWithOutput.toString()} flag did not return data after waiting for promise or completion`;
                                } else if (super.task.hasFlag(TaskFlag.OnceOffWithOutput)) {
                                    super.error = `${task.name}(${task.Id}) task with ${TaskFlag.OnceOffWithOutput.toString()} flag did not return data after waiting for promise or completion`;
                                } else if (super.task.hasFlag(TaskFlag.RepeatNoOutput)) {
                                    super.error = `${task.name}(${task.Id}) task with ${TaskFlag.RepeatNoOutput.toString()} flag did not return data after waiting for promise or completion`;
                                } else if (super.task.hasFlag(TaskFlag.OnceOffNoOutput)) {
                                    super.error = `${task.name}(${task.Id}) task with ${TaskFlag.OnceOffNoOutput.toString()} flag did not return data after waiting for promise or completion`;
                                } else {
                                    super.error = `${task.name}(${task.Id}) task has unknown flag`;
                                }
                            }
                            break;
                        }
                        case TaskRequeueState: {
                            taskPromise.resolve(taskState.data);
                            break;
                        }
                        case TaskCompletedState: {
                            taskPromise.resolve(taskState.data);
                            break;
                        }
                        default: {
                            success = false;
                            super.error = new TaskUnknownStateError(super.task);
                        }
                    }
                }
                if (success) {
                    if (nextState) {
                        this._run();
                    }
                } else {
                    if (super.error) {
                        taskPromise.reject(super.error);
                    } if (taskState.error) {
                        taskPromise.reject(taskState.error);
                    } else {
                        throw new Error('task was not successful. Tip: expectencies not checked in the task state handlers');
                    }
                }
            });
        };
    }
    run() {
        super.isTimeout = false;
        super.startTime = Number(process.hrtime.bigint());
        const timer = setInterval(() => {
            super.endTime = Number(process.hrtime.bigint());
            const diff = super.endTime - super.startTime;
            if (diff >= super.timeout) {
                super.isTimeout = true;
                clearInterval(timer);
            }
        }, 100);
        this._run();
    }
}
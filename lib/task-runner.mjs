import {
    Task,
    TaskContainer,
    TaskQueuedState,
    TaskTimeoutError
} from "./registry.mjs";

export class TaskRunner extends TaskContainer {
    /**
     * @param { Task } task
    */
    constructor(task) {
        super(task);
    }
    run() {
        setImmediate(async () => {
            const taskPromise = super.taskPromise;
            const taskState = super.taskQueue.taskState;
            if (taskState instanceof TaskQueuedState) {
                try {
                    super.startTime = Number(process.hrtime.bigint());
                    const timer = setInterval(() => {
                        super.endTime = Number(process.hrtime.bigint());
                        const diff = super.endTime - super.startTime;
                        if (diff >= super.timeout) {
                            super.isTimeout = true;
                            clearInterval(timer);
                        }
                    }, 100);
                    const success = await taskState.handleTopOfStack();
                    if (success) {
                        super.taskStateStack.shift();
                        if (super.isTimeout) {
                            taskPromise.reject(new TaskTimeoutError(super.task));
                        } else {
                            taskPromise.resolve(taskState.data);
                        }
                    } else {
                        if (taskState.error) {
                            taskPromise.reject(error);
                        } else {
                            if (super.isTimeout) {
                                taskPromise.reject(new TaskTimeoutError(super.task));
                            } else {
                                throw new Error('task was not successful. Tip: expectencies not checked in the task state handlers');
                            }
                        }
                    }
                } catch (error) {
                    taskPromise.reject(error);
                }
            } else {
                this.run();
            }
        });
    }
}
import {
    Task,
    TaskCallbackState,
    TaskState,
    TaskWrongStateError,
    TaskWrongStateHistoryError
} from "../registry.mjs";

export class TaskWaitForPromiseState extends TaskState {
    /**
     * @param { Task } task
    */
    constructor(task) {
        super(task);
    }
    /**
     * @returns { Boolean }
    */
    async handle() {
        if (!super.isAtState(TaskWaitForPromiseState)) {
            super.error = new TaskWrongStateError(super.task, TaskWaitForPromiseState);
            throw super.error;
        }
        if (!super.hadState(TaskCallbackState)) {
            super.error = new TaskWrongStateHistoryError(super.task, TaskCallbackState);
            throw super.error;
        }
        try {
            const taskCallbackState = super.getState(TaskCallbackState);
            if (taskCallbackState.data) {
                return true;
            }
            const promise = new Promise((resolve) => {
                const interval = setInterval(async () => {
                    if (taskCallbackState.promise && !super.promise) {
                        super.promise = taskCallbackState.promise;
                        super.promise.then((data) => {
                            resolve(data);
                        }).catch((error) => {
                            super.error = error;
                            resolve(null);
                        }).finally(() => {
                            clearInterval(interval);
                        });
                    } else if (super.task.data) {
                        clearInterval(interval);
                        resolve(super.task.data);
                    }
                    if (super.task.isTimeout) {
                        clearInterval(interval);
                        resolve(null);
                    }
                }, 100);
            });
            taskCallbackState.data = await promise;
            return true;
        } catch (error) {
            super.error = error;
            return false;
        }
    }
}
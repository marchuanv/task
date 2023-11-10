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
            if (taskCallbackState.promise) {
                const id = setInterval(() => {
                    super.endTime = Number(process.hrtime.bigint());
                }, 100);
                taskCallbackState.data = await taskCallbackState.promise;
                clearInterval(id);
                return true;
            } else if (taskCallbackState.data) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            super.error = error;
            return false;
        } finally {
            super.endTime = Number(process.hrtime.bigint());
        }
    }
}
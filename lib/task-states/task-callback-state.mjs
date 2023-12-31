import {
    Task,
    TaskQueuedState,
    TaskState,
    TaskWrongStateError,
    TaskWrongStateHistoryError
} from "../registry.mjs";

export class TaskCallbackState extends TaskState {
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
        if (!super.isAtState(TaskCallbackState)) {
            super.error = new TaskWrongStateError(super.task, TaskCallbackState);
            throw super.error;
        }
        if (!super.hadState(TaskQueuedState)) {
            super.error = new TaskWrongStateHistoryError(super.task, TaskQueuedState);
            throw super.error;
        }
        try {
            const response = super.callback.call(super.task, super.context, super.data);
            if (response instanceof Promise) {
                super.promise = response;
            } else if (response) {
                super.data = response;
            }
            return true;
        } catch (error) {
            super.error = error;
            return false;
        }
    }
}
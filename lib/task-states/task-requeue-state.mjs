import {
    Task,
    TaskCallbackState,
    TaskState,
    TaskWrongStateError,
    TaskWrongStateHistoryError
} from "../registry.mjs";

export class TaskRequeueState extends TaskState {
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
        if (!super.isAtState(TaskRequeueState)) {
            super.error = new TaskWrongStateError(super.task, TaskRequeueState);
            throw super.error;
        }
        if (!super.hadState(TaskCallbackState)) {
            super.error = new TaskWrongStateHistoryError(super.task, TaskCallbackState);
            throw super.error;
        }
        super.taskQueue.enqueue();
        return true;
    }
}
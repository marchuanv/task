import {
    Task,
    TaskState,
    TaskWrongStateError,
    TaskWrongStateHistoryError
} from "../registry.mjs";

export class TaskQueuedState extends TaskState {
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
        if (!super.isAtState(TaskQueuedState)) {
            super.error = new TaskWrongStateError(super.task, TaskQueuedState);
            throw super.error;
        }
        if (!super.hadState(TaskQueuedState)) {
            super.error = new TaskWrongStateHistoryError(super.task, TaskQueuedState);
            throw super.error;
        }
        return true;
    }
}
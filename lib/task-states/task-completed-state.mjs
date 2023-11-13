import {
    Task,
    TaskState,
    TaskWrongStateError
} from "../registry.mjs";

export class TaskCompletedState extends TaskState {
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
        if (super.isAtState(TaskCompletedState)) {
            return true;
        } else {
            super.error = new TaskWrongStateError(super.task, TaskCompletedState);
            throw super.error;
        }
    }
}
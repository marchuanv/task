import {
    Task,
    TaskState,
    TaskWrongStateError
} from "../registry.mjs";

export class TaskCreatedState extends TaskState {
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
        if (super.isAtState(TaskCreatedState)) {
            return true;
        } else {
            super.error = new TaskWrongStateError(super.task, TaskCreatedState);
            throw super.error;
        }
    }
}
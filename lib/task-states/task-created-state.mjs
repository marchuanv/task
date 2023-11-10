import {
    Task,
    TaskState
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
            super.error = new Error(`${super.task.name}(${super.task.Id}) task is not at the ${TaskCreatedState.name}`);
            return false;
        }
    }
}
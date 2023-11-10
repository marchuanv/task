import {
    Task,
    TaskState
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
        if (super.isAtState(TaskQueuedState)) {
            return true;
        } else {
            super.error = new Error(`${super.task.name}(${super.task.Id}) task is not at the ${TaskQueuedState.name}`);
            return false;
        }
    }
}
import {
    Task,
    TaskCallbackState,
    TaskState
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
        if (super.hadState(TaskCallbackState)) {
            super.error = new Error(`${super.task.name}(${super.task.Id}) task is still at the ready state after callback`);
            return false;
        } else {
            super.taskQueue.enqueue();
            return true;
        }
    }
}
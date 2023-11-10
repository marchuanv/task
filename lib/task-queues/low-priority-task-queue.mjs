import {
    Task,
    TaskQueue
} from "../registry.mjs";

export class LowPriorityTaskQueue extends TaskQueue {
    /**
     * @param { Task } task
     */
    constructor(task) {
        super(task);
    }
}
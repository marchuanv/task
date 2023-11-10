import { Task } from "../registry.mjs";
export class TaskTimeoutError extends Error {
    /**
     * @param { Task } task
    */
    constructor(task) {
        const message = `${task.name}(${task.Id}) task timed out after ${task.endTime - task.startTime}`;
        super(message);
    }
}
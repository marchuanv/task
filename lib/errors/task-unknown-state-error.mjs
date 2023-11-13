import { Task } from "../registry.mjs";
export class TaskUnknownStateError extends Error {
    /**
     * @param { Task } task
    */
    constructor(task) {
        const message = `${task.name}(${task.Id}) task is at an unknown state`;
        super(message);
    }
}
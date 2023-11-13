import { Task } from "../registry.mjs";
export class TaskMoveStateError extends Error {
    /**
     * @param { Task } task
    */
    constructor(task) {
        const message = `${task.name}(${task.Id}) task is stuck at the ${task.state.constructor.name} and did not move to the next state`;
        super(message);
    }
}
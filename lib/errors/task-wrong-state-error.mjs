import { Task } from "../registry.mjs";
export class TaskWrongStateError extends Error {
    /**
     * @param { Task } task
     * @param { class } expectedTaskState
    */
    constructor(task, expectedTaskState) {
        const message = `${task.name}(${task.Id}) task is not at the ${expectedTaskState.name}`;
        super(message);
    }
}
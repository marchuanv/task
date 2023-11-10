import { Task } from "../registry.mjs";
export class TaskWrongStateHistoryError extends Error {
    /**
     * @param { Task } task
     * @param { class } expectedTaskState
    */
    constructor(task, expectedTaskState) {
        const message = `${task.name}(${task.Id}) task history does not contain ${expectedTaskState}`
        super(message);
    }
}
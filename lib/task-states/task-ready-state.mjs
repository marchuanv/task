import { TaskState } from '../task-state.mjs';
import { Task } from '../task.mjs';
export class TaskReadyState extends TaskState {
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
        if (super.isAtState(TaskReadyState)) {
            return true;
        } else {
            super.error = new Error(`${super.task.name}(${super.task.Id}) task is not at the ${TaskReadyState.name}`);
            return false;
        }
    }
}
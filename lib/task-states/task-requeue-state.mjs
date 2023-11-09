import { TaskStateType } from '../task-state-type.mjs';
import { TaskState } from '../task-state.mjs';
import { Task } from '../task.mjs';
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
        if (super.hadState(TaskStateType.Callback)) {
            super.error = new Error(`${super.task.name}(${super.task.Id}) task is still at the ready state after callback`);
            return false;
        } else {
            super.taskQueue.enqueue();
            return true;
        }
    }
}
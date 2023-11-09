import { TaskState } from '../task-state.mjs';
import { Task } from '../task.mjs';
export class TaskCallbackState extends TaskState {
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
        if (super.isAtState(TaskCallbackState)) {
            super.taskProperties.startTime = Number(process.hrtime.bigint());
            try {
                const response = super.taskProperties.callback.call(super.task, super.taskProperties.context, super.taskProperties.data);
                if (response instanceof Promise) {
                    super.promise = response;
                } else if (response) {
                    super.data = response;
                }
            } catch (error) {
                super.error = error;
            } finally {
                super.taskProperties.endTime = Number(process.hrtime.bigint());
                return true;
            }
        } else {
            super.error = new Error(`${super.task.name}(${super.task.Id}) task is not at the ${TaskCallbackState.name}`);
            return false;
        }
    }
}
import {
    Task,
    TaskCallbackState,
    TaskState
} from "../registry.mjs";

export class TaskWaitForPromiseState extends TaskState {
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
            if (super.stateIndex(TaskCallbackState) === 1) {
                try {
                    const taskCallbackState = super.getState(TaskCallbackState);
                    if (taskCallbackState.promise) {
                        const id = setInterval(() => {
                            super.taskProperties.endTime = Number(process.hrtime.bigint());
                        }, 100);
                        taskCallbackState.data = await taskCallbackState.promise;
                        clearInterval(id);
                    } else if (taskCallbackState.data) {
                    } else {
                        return false;
                    }
                } catch (error) {
                    super.error = error;
                } finally {
                    super.taskProperties.endTime = Number(process.hrtime.bigint());
                    return true;
                }
            } else {
                super.error = new Error(`${TaskCallbackState.name} did not occur before ${TaskWaitForPromiseState.name} for the ${super.task.name}(${super.task.Id}) task`);
            }
        } else {
            super.error = new Error(`${super.task.name}(${super.task.Id}) task skipped the ${TaskCallbackState.name}`);
        }
        super.taskProperties.endTime = Number(process.hrtime.bigint());
        return false;
    }
}
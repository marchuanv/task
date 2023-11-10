import {
    Task,
    TaskContainer
} from "./registry.mjs";

const longRunningMilli = 2000000000; //2 seconds for task to become long running

export class TaskRunner extends TaskContainer {
    /**
     * @param { Task } task
    */
    constructor(task) {
        super(task);

    }
    run() {

        // super.taskProperties

        // super.taskStateStack.unshift();

        // const diff = super.taskProperties.endTime - super.taskProperties.startTime;
        // if (diff >= longRunningMilli) {
        //     super.stat.shift(TaskStateType.LongRunning);
        // }
        // if (diff >= super.taskProperties.timeout) {
        //     if (super.taskState !== TaskStateType.Error) {
        //         const milliseconds = (diff / 1000000);
        //         super.taskProperties.error = new Error(`${_task.toString()} task timed out after ${milliseconds} milliseconds`);
        //     }
        //     super.taskState = TaskStateType.Error;
        // }
        // qualifyAsLongRunning() {
        //     if (this.hadState(TaskStateType.LongRunning)) {
        //         return this.taskStateType !== TaskStateType.Error &&
        //             this.taskStateType !== TaskStateType.Requeue &&
        //             this.taskStateType !== TaskStateType.PromiseResolvedNoData &&
        //             this.taskStateType !== TaskStateType.PromiseResolvedWithData;
        //     }
        //     return false;
        // }
    }
}
import { TaskState } from "../lib/task-state.mjs";
import { Task } from "../task.mjs";
export class TestTask extends Task {
    /**
     * @param { String } name
     * @param { Array<TaskFlag> } flags
    */
    constructor(name, flags = []) {
        super(name, { Id: `${name}Id` }, {}, flags);
    }
    /**
     * @param { String } name,
     * @param { Array<TaskFlag> } flags
     * @returns { TestTask }
    */
    static create(name, flags = []) {
        return new TestTask(name, flags);
    }
    /**
     * @param { T } type
     * @param { Function } callback
     * @returns { Promise<T> }
    */
    queue(callback) {
        return super.queue(Object.prototype, callback);
    }
    isLongRunning() {
        return new Promise((resolve) => {
            let _isLongRunning = false;
            setTimeout(() => {
                if (super.hadState(TaskState.LongRunning)) {
                    _isLongRunning = true;
                }
                resolve(_isLongRunning);
            }, 3000);
        });
    }
}

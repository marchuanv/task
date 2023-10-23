import { TaskState } from "../lib/task-state.mjs";
import { Task } from "../task.mjs";
export class TestTask extends Task {
    /**
     * @param { Object } testSuite
     * @param { String } name
     * @param { Array<TaskFlag> } flags
    */
    constructor(testSuite, name, flags = []) {
        super(name, { Id: `${name}Id` }, {}, flags);
        this.suite = testSuite;
    }
    /**
     * @param { Object } testSuite
     * @param { String } name
     * @param { Array<TaskFlag> } flags
     * @returns { TestTask }
    */
    static create(testSuite, name, flags = []) {
        return new TestTask(testSuite, name, flags);
    }
    /**
     * @param { T } type
     * @param { Function } callback
     * @returns { Promise<T> }
    */
    queue(callback) {
        process.specs.get(this.suite).push(this);
        return super.queue(Object.prototype, callback);
    }
    isLongRunning(timeoutMill) {
        return new Promise((resolve) => {
            let _isLongRunning = false;
            setTimeout(() => {
                if (super.hadState(TaskState.LongRunning)) {
                    _isLongRunning = true;
                }
                resolve(_isLongRunning);
            }, timeoutMill);
        });
    }
}

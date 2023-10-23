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
    queue(timeoutMill, callback) {
        process.specs.get(this.suite).push(this);
        return new Promise(async (resolve, rejected) => {
            try {
                const results = await super.queue(Object.prototype, callback);
                let isLongRunning = false;
                setTimeout(async () => {
                    isLongRunning = super.hadState(TaskState.LongRunning);
                    resolve({ results, isLongRunning });
                }, timeoutMill);
            } catch (error) {
                rejected(error);
            }
        });
    }
}

function getPromiseState(p) {
    const t = {};
    return Promise.race([p, t])
        .then(v => (v === t) ? "pending" : "fulfilled", () => "rejected");
}

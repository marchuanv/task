import { TaskState } from "../lib/task-state.mjs";
import { Task } from "../task.mjs";
const nanoSecTimeout = 2000000000; //2 seconds
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
    run(timeoutMill, callback) {
        process.specs.get(this.suite).push(this);
        return new Promise(async (resolve, rejected) => {
            super.run(Object.prototype, callback).then(() => {
                setTimeout(async () => {
                    resolve(this);
                }, (timeoutMill + 1000));
            }).catch(() => {
                rejected(this);
            });
        });
    }
    simulateDelay() {
        const startTime = Number(process.hrtime.bigint());
        return new Promise((resolve) => {
            const isTimeout = () => {
                const endTime = Number(process.hrtime.bigint());
                const diff = (endTime - startTime);
                if (diff >= nanoSecTimeout) {
                    return true;
                }
                return false;
            };
            const recurseCheck = () => {
                setImmediate(() => {
                    if (isTimeout()) {
                        resolve();
                    } else {
                        recurseCheck();
                    }
                });
            }
            recurseCheck();
        });
    }
    /**
     * @returns { Boolean }
     */
    get isLongRunning() {
        return super.hadState(TaskState.LongRunning);
    }
}
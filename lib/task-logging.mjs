import { Task } from "../task.mjs";
const privateBag = new WeakMap();
const tasks = [];
export class TaskLogging {
    static initialise() {
        process.on('exit', () => {
            let task = tasks.shift();
            while (task) {
                let messages = privateBag.get(task);
                messages = messages.sort((x, y) => {
                    if (x.time > y.time) {
                        return 1;
                    }
                    return -1;
                }).map(x => x.message);
                messages.push('process exit');
                console.log('');
                const { Id, flags } = task;
                console.log(`Task: ${Id}, Flags: ${flags.join(' | ')}`);
                for (const message of messages) {
                    console.log(` -> ${message}`);
                }
                task = tasks.shift();
            }
        });
    }
    /**
     * @param { Task } task
     * @param { String } message
    */
    static log(task, message) {
        const logTime = process.hrtime.bigint();
        if (message instanceof Error) {
            message = message.message;
        }
        if (privateBag.has(task)) {
            const entries = privateBag.get(task);
            if (entries.find(e => e.message === message)) {
                message = `${message} (REPEAT)`;
            }
            if (!entries.find(e => e.message === message)) {
                entries.push({ time: logTime, message });
            }
        } else {
            privateBag.set(task, [{ time: logTime, message }]);
            tasks.push(task);
        }
    }
}
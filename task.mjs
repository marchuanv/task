import crypto from 'node:crypto';
import { TaskFlag } from "./lib/task-flag.mjs";
import { TaskState } from './lib/task-state.mjs';
const loopIntervalMilli = 100;
const queueMilli = 100;
const criteriaLongRunningMilli = 1000;
let tasks = [];
let taskErrors = [];

const taskLoop = setInterval(async () => {
    let task = tasks.shift();
    if (task) {
        await handleTask(task);
    }
}, loopIntervalMilli);
const loggingLoop = setInterval(() => {
    console.log('');
    console.log('Loop Info:');
    console.log(`- Task Count: ${tasks.length}`);
    console.log(`- Long Running Task Count: ${tasks.filter(t => t.state === TaskState.LongRunning).length}`);
    if (taskErrors.length > 0) {
        console.log(`- Task Errors:`);
        for (const task of taskErrors) {
            console.error(task.error);
            console.error(task.stack);
        }
        clearInterval(loggingLoop);
        process.exit(1);
    }
    console.log('');
}, 5000);

export class Task {
    /**
     * @param { Strng } name,
     * @param { class } context
     * @param { Array<TaskFlag> } flags
     * @returns { Task }
    */
    static create(name, context, data, flags = []) {
        const task = new Task();
        if (context && context.constructor) {
            task.context = context;
            task.name = `${context.constructor.name}_${name}`;
            task.contextId = context.Id;
        }
        task.flags = flags;
        task.error = null;
        task.callback = null;
        task.data = data;
        task.history = [];
        task.Id = crypto.randomUUID();
        task.time = 0;
        task.dependencies = [];
        task.stack = (new Error()).stack;
        return task;
    }
    /**
    * @param { T } type
    * @param { Function } callback
    * @returns { Promise<T> }
    */
    queue(type, callback) {
        return new Promise((resolve) => {
            setTimeout(async () => {

                if (!this.name || !this.context) {
                    clearInterval(taskLoop);
                    this.error = new Error('task does not have a name or context');
                    this.setState(TaskState.Error);
                    return taskErrors.push(this);
                }

                const isRequeue = (this.state && (this.state !== TaskState.Ready && this.state !== TaskState.Queued));

                this.setState(TaskState.Queued);

                this.time = this.time + queueMilli;

                if (this.time > criteriaLongRunningMilli) {
                    this.setState(TaskState.LongRunning);
                }

                //get the same tasks but executed in a different context
                const matchingTaskInDifferentContext = tasks.find(x => x.name === this.name && x.contextId !== this.context);
                const matchingTaskInSameContext = tasks.find(x => x.name === this.name && x.contextId === this.contextId && x.Id !== this.Id);
                if ((matchingTaskInDifferentContext || matchingTaskInSameContext) && !isRequeue) {
                    this.dependencies.push(matchingTaskInDifferentContext);
                    this.dependencies.push(matchingTaskInSameContext);
                    this.dependencies = this.dependencies.filter(d => d);
                    this.dependencies = new Set(this.dependencies);
                    this.dependencies = [...this.dependencies];
                    tasks.push(this);
                } else if (isRequeue || this.state === TaskState.LongRunning) {
                    tasks.push(this);
                } else {
                    tasks.unshift(this);
                }
                tasks = tasks.sort(taskPrioritySort);
                if (!this.callback) {
                    if (callback) {
                        this.callback = callback;
                    } else {
                        throw new Error('callback argument was not provided');
                    }
                }
                if (!this.resolve) {
                    this.resolve = resolve;
                }
                this.setState(TaskState.Ready);
            }, queueMilli);
        });
    }
    /**
     * @param { Object }
    */
    complete(value) {
        if (this.resolve) {
            this.value = value;
            this.resolve(this.value);
            if (this.value === undefined || this.value === null) {
                this.setState(TaskState.PromiseResolvedNoResults);
            } else {
                this.setState(TaskState.PromiseResolvedWithResults);
            }
            console.log(`${this.context}: handled ${this.name}(${this.Id}) task`);
        } else {
            this.setState(TaskState.Error);
            clearInterval(taskLoop);
            this.error = new Error(`critical error, complete task was called without a promise resolve function`);
            taskErrors.push(this);
        }
    }
    /**
     * @param { TaskFlag } flag
     * @returns { Boolean }
     */
    hasFlag(flag) {
        for (const _flag of this.flags) {
            if (flag === _flag) {
                return true;
            }
        }
        return false;
    }
    /**
     * @param { TaskState } state
     * @returns { Boolean }
     */
    setState(state) {
        this.state = state;
        this.history.push(state);
    }
}
/**
 * @param { Task } task
 */
async function handleTask(task) {
    if (task.state === TaskState.Ready) {
        const nonLongRunningTasks = task.dependencies.filter(td => td.state !== TaskState.LongRunning);
        const doneDependantTaskCount = nonLongRunningTasks.filter(td => td.state === TaskState.Done).length;
        const totalDependantTaskCount = nonLongRunningTasks.length;
        if (doneDependantTaskCount !== totalDependantTaskCount) { //are all the dependencies finished?
            task.queue();
        } else {
            try {
                task.setState(TaskState.CallbackStarted);
                await task.callback.call(task, task.context, task.data);
                if (task.state === TaskState.CallbackStarted) {
                    task.setState(TaskState.CallbackReturned);
                }
            } catch (error) {
                console.log(`${task.context}: ${task.name}(${task.Id}) task error`);
                task.setState(TaskState.Error);
                task.error = error;
            } finally {
                handleTaskState(task);
            }
        }
    } else {
        task.queue();
    }
}
/**
 * @param { Task } task
 */
function handleTaskState(task) {
    switch (task.state) {
        case TaskState.Ready: {
            clearInterval(taskLoop);
            task.error = new Error(`${task.name}(${task.Id}) task is still at the ready state after callback`);
            taskErrors.push(task);
            break;
        }
        case TaskState.PromiseResolvedWithResults: {
            if (task.hasFlag(TaskFlag.Repeat)) {
                task.setState(TaskState.Done);
                task.queue();
            } else if (task.hasFlag(TaskFlag.OnceOff)) {
                task.setState(TaskState.Done);
            } else if (task.hasFlag(TaskFlag.RepeatUntilValidResponse)) {
                task.setState(TaskState.Done);
            } else {
                task.error = new Error(`unable to handle state: ${TaskState.PromiseResolvedWithResults.constructor.name}`);
                clearInterval(taskLoop);
                taskErrors.push(task);
            }
            break;
        }
        case TaskState.PromiseResolvedNoResults: {
            if (task.hasFlag(TaskFlag.ValidResponse)) {
                task.error = new Error(`${task.name}(${task.Id}) task completed without a valid response`);
                clearInterval(taskLoop);
                taskErrors.push(task);
            } else {
                task.error = new Error(`unable to handle state: ${TaskState.PromiseResolvedNoResults.constructor.name}`);
                clearInterval(taskLoop);
                taskErrors.push(task);
            }
            break;
        }
        case TaskState.CallbackReturned: {
            // if (task.name === 'MessageBus_clientconnect') {
            //     console.log();
            // }
            if (task.hasFlag(TaskFlag.WaitForValidResponse)) {
                task.setState(TaskState.LongRunning);
                handleTaskState(task);
            } else if (task.hasFlag(TaskFlag.RepeatUntilValidResponse)) {
                if (task.history.find(state => state === TaskState.PromiseResolvedNoResults)) {
                    task.setState(TaskState.PromiseResolvedNoResults);
                    handleTaskState(task);
                } else if (task.history.find(state => state === TaskState.PromiseResolvedWithResults)) {
                    task.setState(TaskState.PromiseResolvedWithResults);
                    handleTaskState(task);
                } else {
                    task.queue(); //repeat the task until it eventually responds
                }
            } else if (task.hasFlag(TaskFlag.ValidResponse)) {
                task.error = new Error(`${task.name}(${task.Id}) task was not completed. Config indicated that a valid response is required.`);
                clearInterval(taskLoop);
                taskErrors.push(task);
            } else {
                task.setState(TaskState.Done);
            }
            break;
        }
        case TaskState.Error: {
            if (task.hasFlag(TaskFlag.HandleErrors)) {
                clearInterval(taskLoop);
            } else if (task.hasFlag(TaskFlag.IgnoreErrors)) {
                //nothing for now let it step over and add task to task errors
            } else {
                task.error = new Error(`unable to handle state: ${TaskState.Error.constructor.name}`);
                clearInterval(taskLoop);
            }
            taskErrors.push(task);
            break;
        }
        case TaskState.LongRunning: {
            if (task.hasFlag(TaskFlag.WaitForValidResponse)) {
                console.log(`${task.name}(${task.Id}) task is still running`);
                setTimeout(() => handleTaskState(task), 1000);
            } else {
                task.error = new Error(`unable to handle state: ${TaskState.LongRunning.constructor.name}`);
                clearInterval(taskLoop);
                taskErrors.push(task);
            }
            break;
        }
        default: {
            clearInterval(taskLoop);
            task.error = new Error('unhandled state');
            taskErrors.push(task);
            break;
        }
    }
}
/**
 * @param { Task } taskA
 * @param { Task } taskB
 * @returns { Number }
 */
function taskPrioritySort(taskA, taskB) {
    const taskAHighPriority = taskA.hasFlag(TaskFlag.HighPriority);
    const taskAMediumPriority = taskA.hasFlag(TaskFlag.MediumPriority);
    const taskALowPriority = taskA.hasFlag(TaskFlag.LowPriority);
    const taskBHighPriority = taskB.hasFlag(TaskFlag.HighPriority);
    const taskBMediumPriority = taskB.hasFlag(TaskFlag.MediumPriority);
    const taskBLowPriority = taskB.hasFlag(TaskFlag.LowPriority);
    if ((taskAHighPriority && taskBHighPriority) || (taskAMediumPriority && taskBMediumPriority) || (taskALowPriority && taskBLowPriority)) {
        return 0;
    }
    if (taskAHighPriority && (taskBMediumPriority || taskBLowPriority)) {
        return -1;
    } else if (taskAMediumPriority && taskBLowPriority) {
        return -1;
    } else {
        return 1;
    }
}
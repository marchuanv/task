import { Task } from '../task.mjs';
import { TaskFlag } from "./task-flag.mjs";
import { TaskLogging } from './task-logging.mjs';
import { TaskProperties } from './task-properties.mjs';
import { TaskState } from './task-state.mjs';

let privateBag;
new TaskProperties((_privateBag) => {
    privateBag = _privateBag;
});

const longRunningMilli = 2000000000; //2 seconds for task to become long running
const longRunningTimeoutMilli = 60000000000; //60 seconds for task to timeout

privateBag.set(TaskFlag, [TaskFlag.HighPriority, TaskFlag.MediumPriority, TaskFlag.LowPriority]);
privateBag.set(TaskFlag.HighPriority, { locked: false, tasks: [] });
privateBag.set(TaskFlag.MediumPriority, { locked: false, tasks: [] });
privateBag.set(TaskFlag.LowPriority, { locked: false, tasks: [] });
privateBag.set(TaskState.Error, []);

function selectQueue() {
    let queue = privateBag.get(TaskFlag.HighPriority);
    if (queue.tasks.length === 0) {
        queue = privateBag.get(TaskFlag.MediumPriority);
        if (queue.tasks.length === 0) {
            queue = privateBag.get(TaskFlag.LowPriority);
        }
    }
    return queue;
}

function dequeueTasks() {
    const queue = selectQueue();
    if (!queue.locked) {
        setImmediate(async () => {
            let task = queue.tasks.shift();
            while (task) {
                TaskLogging.log(task, `dequeued`);
                const properties = privateBag.get(task);
                const { context, data, dependencies } = properties;
                try {
                    if (properties.state === TaskState.Ready) {
                        const nonLongRunningTasks = dependencies.filter(td => td.state !== TaskState.LongRunning);
                        const doneDependantTaskCount = nonLongRunningTasks.filter(td => td.state === TaskState.Done).length;
                        const totalDependantTaskCount = nonLongRunningTasks.length;
                        if (doneDependantTaskCount === totalDependantTaskCount) {
                            properties.state = TaskState.CallbackStarted;
                            properties.states.push(properties.state);
                            properties.startTime = Number(process.hrtime.bigint());
                            await properties.callback.call(task, context, data);
                            properties.endTime = Number(process.hrtime.bigint());
                            if (properties.state === TaskState.CallbackStarted) {
                                properties.state = TaskState.CallbackReturned;
                                properties.states.push(properties.state);
                            }
                        } else { //are all the dependencies finished?
                            properties.state = TaskState.Requeue;
                            properties.states.push(properties.state);
                        }
                    } else {
                        properties.state = TaskState.Requeue;
                        properties.states.push(properties.state);
                    }
                } catch (error) {
                    properties.endTime = process.hrtime.bigint();
                    if (!properties.error) {
                        properties.error = error;
                    }
                    properties.state = TaskState.Error;
                    properties.states.push(properties.state);
                } finally {
                    const handleState = () => {
                        TaskLogging.log(task, `State: ${task.state.toString()}`);
                        const diff = properties.endTime - properties.startTime;
                        if (diff >= longRunningMilli) {
                            properties.states.push(TaskState.LongRunning);
                        }
                        if (diff >= longRunningTimeoutMilli) {
                            if (properties.state !== TaskState.Error) {
                                properties.error = new Error(`${task.toString()} task timeout, it has been running for more than one minute`);
                            }
                            properties.state = TaskState.Error;
                            properties.states.push(properties.state);
                        }
                        if (task.hadState(TaskState.LongRunning)) {
                            const canSetToLongRunning =
                                properties.state !== TaskState.Error &&
                                properties.state !== TaskState.Requeue &&
                                properties.state !== TaskState.PromiseResolvedNoResults &&
                                properties.state !== TaskState.PromiseResolvedWithResults;
                            if (canSetToLongRunning) {
                                properties.state = TaskState.LongRunning;
                            }
                        }
                        properties.states = new Set(properties.states);
                        properties.states = [...properties.states];
                        TaskLogging.log(task, `State: ${task.state.toString()}`);
                        switch (task.state) {
                            case TaskState.Requeue: {
                                TaskQueue.enqueue(task);
                                break;
                            }
                            case TaskState.Created: {
                                properties.error = new Error(`${task.name}(${task.Id}) task is still at the created state`);
                                properties.state = TaskState.Error;
                                properties.states.push(properties.state);
                                handleState();
                                break;
                            }
                            case TaskState.Ready: {
                                properties.error = new Error(`${task.name}(${task.Id}) task is still at the ready state`);
                                properties.state = TaskState.Error;
                                properties.states.push(properties.state);
                                handleState();
                                break;
                            }
                            case TaskState.PromiseResolvedWithResults: {
                                if (task.hasFlag(TaskFlag.RepeatNoDataResolve)) {
                                    properties.error = new Error(`${task.toString()} task is configured to repeat and resolve with not data, but was resolved with data`);
                                    properties.state = TaskState.Error;
                                    properties.states.push(properties.state);
                                    handleState();
                                    break;
                                } else if (task.hasFlag(TaskFlag.RepeatDataResolve)) {
                                    properties.state = TaskState.Requeue;
                                    properties.states.push(properties.state);
                                    properties.resolve(properties.value);
                                    handleState();
                                    break;
                                } else if (task.hasFlag(TaskFlag.OnceOffDataResolve)) {
                                    properties.state = TaskState.Done;
                                    properties.states.push(properties.state);
                                    properties.resolve(properties.value);
                                    break;
                                } else if (task.hasFlag(TaskFlag.OnceOffNoDataResolve)) {
                                    properties.error = new Error(`${task.toString()} task is configured to be once off and resolve with not data, but was resolved with data`);
                                    properties.state = TaskState.Error;
                                    properties.states.push(properties.state);
                                    handleState();
                                    break;
                                } else {
                                    properties.error = new Error(`unable to handle state: ${TaskState.PromiseResolvedWithResults.constructor.name}`);
                                    properties.state = TaskState.Error;
                                    properties.states.push(properties.state);
                                    handleState();
                                    break;
                                }
                            }
                            case TaskState.PromiseResolvedNoResults: {
                                if (task.hasFlag(TaskFlag.RepeatNoDataResolve)) {
                                    properties.state = TaskState.Requeue;
                                    properties.states.push(properties.state);
                                    properties.resolve(null);
                                    handleState();
                                    break;
                                } else if (task.hasFlag(TaskFlag.RepeatDataResolve)) {
                                    properties.error = new Error(`${task.toString()} task is configured to repeat and resolve with data, but was not resolved with data`);
                                    properties.state = TaskState.Error;
                                    properties.states.push(properties.state);
                                    handleState();
                                    break;
                                } else if (task.hasFlag(TaskFlag.OnceOffDataResolve)) {
                                    properties.error = new Error(`${task.toString()} task is configured to be once off and resolve with data, but was not resolved with data`);
                                    properties.state = TaskState.Error;
                                    properties.states.push(properties.state);
                                    handleState();
                                    break;
                                } else if (task.hasFlag(TaskFlag.OnceOffNoDataResolve)) {
                                    properties.state = TaskState.Done;
                                    properties.states.push(properties.state);
                                    properties.resolve(null);
                                    break;
                                } else {
                                    properties.error = new Error(`unable to handle state: ${TaskState.PromiseResolvedNoResults.constructor.name}`);
                                    properties.state = TaskState.Error;
                                    properties.states.push(properties.state);
                                    handleState();
                                    break;
                                }
                            }
                            case TaskState.CallbackReturned: {
                                if (task.hasFlag(TaskFlag.RepeatNoDataResolve)) { //no need to wait for the task to call complete
                                    task.complete(null);
                                    properties.resolve(null);
                                    handleState();
                                    break;
                                } else if (task.hasFlag(TaskFlag.RepeatDataResolve)) { //needs to wait for the task to call complete
                                    handleState();
                                    break;
                                } else if (task.hasFlag(TaskFlag.OnceOffDataResolve)) {
                                    properties.error = new Error(`${task.toString()} task is configured to be once off and to resolve with data, call complete on the task`);
                                    properties.state = TaskState.Error;
                                    properties.states.push(properties.state);
                                    handleState();
                                    break;
                                } else if (task.hasFlag(TaskFlag.OnceOffNoDataResolve)) {
                                    task.complete(null);
                                    properties.resolve(null);
                                    handleState();
                                    break;
                                } else {
                                    properties.error = new Error(`unable to handle state: ${TaskState.CallbackReturned.constructor.name}`);
                                    properties.state = TaskState.Error;
                                    properties.states.push(properties.state);
                                    handleState();
                                    break;
                                }
                            }
                            case TaskState.LongRunning: {
                                if (task.hasFlag(TaskFlag.RepeatNoDataResolve)) { //no need to wait for the task to call complete
                                    task.complete(null);
                                    properties.resolve(null);
                                    handleState();
                                    break;
                                } else if (task.hasFlag(TaskFlag.RepeatDataResolve)) { //needs to wait for the task to call complete
                                    handleState();
                                    break;
                                } else if (task.hasFlag(TaskFlag.OnceOffDataResolve)) {
                                    properties.error = new Error(`${task.toString()} task is configured to be once off and to resolve with data, call complete on the task`);
                                    properties.state = TaskState.Error;
                                    properties.states.push(properties.state);
                                    handleState();
                                    break;
                                } else if (task.hasFlag(TaskFlag.OnceOffNoDataResolve)) {
                                    task.complete(null);
                                    properties.resolve(null);
                                    handleState();
                                    break;
                                } else {
                                    properties.error = new Error(`unable to handle state: ${TaskState.CallbackReturned.constructor.name}`);
                                    properties.state = TaskState.Error;
                                    properties.states.push(properties.state);
                                    handleState();
                                    break;
                                }
                            }
                            case TaskState.Error: {
                                if (task.hasFlag(TaskFlag.HandleErrors)) {
                                    privateBag.get(TaskState.Error).push(task);
                                } else if (task.hasFlag(TaskFlag.IgnoreErrors)) {
                                    console.error(properties.error);
                                    privateBag.get(TaskState.Error).push(task);
                                    break;
                                } else {
                                    properties.error = new Error(`unable to handle state: ${TaskState.Error.constructor.name}`);
                                    privateBag.get(TaskState.Error).push(task);
                                }
                                break;
                            }
                            default: {
                                properties.error = new Error('task is in an unknown state');
                                properties.state = TaskState.Error;
                                properties.states.push(properties.state);
                                handleState();
                                break;
                            }
                        }
                        TaskLogging.log(task, `State: ${task.state.toString()}`);
                    };
                    handleState();
                }
                task = queue.tasks.shift();
            }
        });
    }
    const errorQueue = privateBag.get(TaskState.Error);
    let taskError = errorQueue.shift();
    while (taskError) {
        const { error } = privateBag.get(taskError);
        TaskLogging.log(taskError, `State: ${taskError.state.toString()}`);
        TaskLogging.log(taskError, error);
        taskError = errorQueue.shift();
    }
    setTimeout(dequeueTasks, 100);
}
dequeueTasks();

export class TaskQueue {
    /**
     * @param { Task } task
    */
    static enqueue(task) {
        setTimeout(() => {
            const properties = privateBag.get(task);
            const { state, name, contextId, dependencies, callback, resolve } = properties;
            if (!callback || !resolve) {
                throw new Error('task was not queued');
            }
            for (const priority of privateBag.get(TaskFlag)) {
                if (task.hasFlag(priority)) {
                    let queue = privateBag.get(priority);
                    try {
                        properties.state = TaskState.Queued;
                        properties.states.push(properties.state);
                        queue.locked = true;
                        //get the same tasks but executed in a different context
                        const matchingTaskInDifferentContext = queue.tasks.find(x => x.name === name && x.contextId !== contextId);
                        const matchingTaskInSameContext = queue.tasks.find(x => x.name === name && x.contextId === contextId && x.Id !== task.Id);
                        if ((matchingTaskInDifferentContext || matchingTaskInSameContext) && !isRequeue) {
                            dependencies.push(matchingTaskInDifferentContext);
                            dependencies.push(matchingTaskInSameContext);
                            dependencies = dependencies.filter(d => d);
                            dependencies = new Set(dependencies);
                            dependencies = [...dependencies];
                            queue.tasks.push(task);
                        } else if (state === TaskState.Requeue || state === TaskState.LongRunning) {
                            queue.tasks.push(task);
                        } else {
                            queue.tasks.unshift(task);
                        }
                        properties.enqueueCount = properties.enqueueCount + 1;
                        properties.state = TaskState.Ready;
                        properties.states.push(properties.state);
                        queue.tasks = queue.tasks.sort((taskA, taskB) => {
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
                        });
                    } finally {
                        queue.locked = false;
                    }
                }
            }
        }, 1000);
    }
}
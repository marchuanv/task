import { Task } from '../task.mjs';
import { TaskFlag } from "./task-flag.mjs";
import { TaskLogging } from './task-logging.mjs';
import { TaskProperties } from './task-properties.mjs';
import { TaskState } from './task-state.mjs';

let privateBag = new WeakMap();

const longRunningMilli = 2000000000; //2 seconds for task to become long running

privateBag.set(TaskFlag, [TaskFlag.HighPriority, TaskFlag.MediumPriority, TaskFlag.LowPriority]);
privateBag.set(TaskFlag.HighPriority, { locked: false, tasks: [] });
privateBag.set(TaskFlag.MediumPriority, { locked: false, tasks: [] });
privateBag.set(TaskFlag.LowPriority, { locked: false, tasks: [] });

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

const handleState = (_task) => {
    const properties = privateBag.get(_task);

    const diff = properties.endTime - properties.startTime;
    if (diff >= longRunningMilli) {
        properties.stateHistory.push(TaskState.LongRunning);
    }
    if (diff >= properties.timeout) {
        if (properties.state !== TaskState.Error) {
            const milliseconds = (diff / 1000000);
            properties.error = new Error(`${_task.toString()} task timed out after ${milliseconds} milliseconds`);
        }
        properties.state = TaskState.Error;
    }
    if (_task.hadState(TaskState.LongRunning)) {
        const canSetToLongRunning =
            properties.state !== TaskState.Error &&
            properties.state !== TaskState.Requeue &&
            properties.state !== TaskState.PromiseResolvedNoData &&
            properties.state !== TaskState.PromiseResolvedWithData;
        if (canSetToLongRunning) {
            properties.state = TaskState.LongRunning;
        }
    }
    switch (_task.state) {
        case TaskState.Requeue: {
            TaskQueue.enqueue(_task, properties);
            break;
        }
        case TaskState.Created: {
            properties.error = new Error(`${_task.name}(${_task.Id}) task is still at the created state`);
            properties.state = TaskState.Error;
            handleState.call(this, _task);
            break;
        }
        case TaskState.Ready: {
            properties.error = new Error(`${_task.name}(${_task.Id}) task is still at the ready state`);
            properties.state = TaskState.Error;
            handleState.call(this, _task);
            break;
        }
        case TaskState.WaitForPromiseResolve: {
            if (_task.hasFlag([TaskFlag.RepeatWithOutput, TaskFlag.OnceOffWithOutput, TaskFlag.RepeatNoOutput, TaskFlag.OnceOffNoOutput])) {
                //need to wait for promise
                setTimeout.call(this, () => {
                    properties.endTime = Number(process.hrtime.bigint());
                    handleState.call(this, _task);
                }, 1000);
            } else {
                properties.error = new Error(`unable to handle state: ${TaskState.WaitForPromiseResolve.constructor.name}`);
                properties.state = TaskState.Error;
                handleState.call(this, _task);
            }
            break;
        }
        case TaskState.PromiseResolvedWithData: {
            if (_task.hasFlag(TaskFlag.RepeatWithOutput)) {
                properties.state = TaskState.Requeue;
                properties.promise.resolve();
                handleState.call(this, _task);
            } else if (_task.hasFlag(TaskFlag.OnceOffWithOutput)) {
                properties.state = TaskState.Done;
                properties.promise.resolve();
            } else if (_task.hasFlag(TaskFlag.OnceOffNoOutput) || _task.hasFlag(TaskFlag.RepeatNoOutput)) {
                properties.error = new Error(`${_task.toString()} task is configured to NOT resolve with data`);
                properties.state = TaskState.Error;
                handleState.call(this, _task);
            } else {
                properties.error = new Error(`unable to handle state: ${TaskState.PromiseResolvedWithData.constructor.name}`);
                properties.state = TaskState.Error;
                handleState.call(this, _task);
            }
            break;
        }
        case TaskState.PromiseResolvedNoData: {
            if (_task.hasFlag(TaskFlag.RepeatNoOutput)) {
                properties.state = TaskState.Requeue;
                properties.promise.resolve();
                handleState.call(this, _task);
            } else if (_task.hasFlag(TaskFlag.OnceOffNoOutput)) {
                properties.state = TaskState.Done;
                properties.promise.resolve();
            } else if (_task.hasFlag(TaskFlag.RepeatWithOutput) || _task.hasFlag(TaskFlag.OnceOffWithOutput)) {
                properties.error = new Error(`${_task.toString()} task is configured to resolve with data, but was not resolved with valid data`);
                properties.state = TaskState.Error;
                handleState.call(this, _task);
            } else {
                properties.error = new Error(`unable to handle state: ${TaskState.PromiseResolvedNoData.constructor.name}`);
                properties.state = TaskState.Error;
                handleState.call(this, _task);
            }
            break;
        }
        case TaskState.LongRunning: {
            if (_task.hadState(TaskState.WaitForPromiseResolve)) {
                setTimeout.call(this, () => {
                    properties.endTime = Number(process.hrtime.bigint());
                    handleState.call(this, _task);
                }, 1000);
            } else {
                properties.error = new Error(`${_task.toString()} task state is ${TaskState.LongRunning.toString()} call complete`);
                properties.state = TaskState.Error;
                handleState.call(this, _task);
            }
            break;
        }
        case TaskState.Error: {
            if (_task.hasFlag(TaskFlag.HandleErrors)) {
                properties.promise.reject();
            } else if (_task.hasFlag(TaskFlag.IgnoreErrors) && (_task.hasFlag(TaskFlag.RepeatNoOutput) || _task.hasFlag(TaskFlag.RepeatWithOutput))) {
                properties.state = TaskState.Requeue;
                handleState.call(this, _task);
            } else {
                properties.error = new Error(`unable to handle state: ${TaskState.Error.constructor.name}`);
                properties.promise.reject();
            }
            break;
        }
        default: {
            TaskLogging.log(_task, `State: Unknown`);
            properties.error = new Error('task is in an unknown state');
            properties.state = TaskState.Error;
            handleState.call(this, _task);
            break;
        }
    }
};

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
                            properties.state = TaskState.Callback;
                            properties.startTime = Number(process.hrtime.bigint());
                            await properties.callback.call(task, context, data);
                            properties.endTime = Number(process.hrtime.bigint());
                            if (properties.state === TaskState.Callback) {
                                properties.state = TaskState.WaitForPromiseResolve;
                            }
                        } else { //are all the dependencies finished?
                            properties.state = TaskState.Requeue;
                        }
                    } else {
                        properties.state = TaskState.Requeue;
                    }
                } catch (error) {
                    properties.endTime = Number(process.hrtime.bigint());
                    if (!properties.error) {
                        properties.error = error;
                    }
                    properties.state = TaskState.Error;
                } finally {
                    handleState(task);
                }
                task = queue.tasks.shift();
            }
        });
    }
    setTimeout(dequeueTasks, 100);
}
dequeueTasks();

export class TaskQueue {
    /**
     * @param { Task } task
     * @param { TaskProperties } properties
    */
    static enqueue(task, properties) {
        setTimeout(() => {
            const { name, contextId, dependencies, callback, promise } = properties;
            if (!callback) {
                properties.error = new Error(`${task.toString()} was not queued, no callback function`);
                return promise.reject();
            }
            for (const priority of privateBag.get(TaskFlag)) {
                if (task.hasFlag(priority)) {
                    let queue = privateBag.get(priority);
                    try {
                        properties.state = TaskState.Queued;
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
                        } else if (properties.state === TaskState.Requeue || properties.state === TaskState.LongRunning) {
                            queue.tasks.push(task);
                        } else {
                            queue.tasks.unshift(task);
                        }
                        privateBag.delete(task);
                        privateBag.set(task, properties);
                        properties.enqueueCount = properties.enqueueCount + 1;
                        properties.state = TaskState.Ready;
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
import { Task } from '../task.mjs';
import { Logging } from './logging.mjs';
import { TaskFlag } from "./task-flag.mjs";
import { TaskProperties } from './task-properties.mjs';
import { TaskState } from './task-state.mjs';

let privateBag;
new TaskProperties((_privateBag) => {
    privateBag = _privateBag;
});

const longRunningMilli = 2000000000; //2 seconds for task to become long running
const longRunningTimeoutMilli = 60000000000; //60 seconds for task to timeout

privateBag.set(TaskFlag, [TaskFlag.HighPriority, TaskFlag.MediumPriority, TaskFlag.LowPriority]);
privateBag.set(TaskFlag.HighPriority, []);
privateBag.set(TaskFlag.MediumPriority, []);
privateBag.set(TaskFlag.LowPriority, []);
privateBag.set(TaskFlag.LowPriority, []);

function taskLoop() {
    setImmediate(async () => {
        let queue = privateBag.get(TaskFlag.HighPriority);
        if (queue.length === 0) {
            queue = privateBag.get(TaskFlag.MediumPriority);
            if (queue.length === 0) {
                queue = privateBag.get(TaskFlag.LowPriority);
            }
        }
        if (queue.length > 0) {
            const task = queue.shift();
            Logging.log(task, `task dequeued`);
            const properties = privateBag.get(task);
            properties.time = process.hrtime.bigint();
            const { context, data, dependencies } = properties;
            try {
                if (properties.state === TaskState.Ready) {
                    const nonLongRunningTasks = dependencies.filter(td => td.state !== TaskState.LongRunning);
                    const doneDependantTaskCount = nonLongRunningTasks.filter(td => td.state === TaskState.Done).length;
                    const totalDependantTaskCount = nonLongRunningTasks.length;
                    if (doneDependantTaskCount === totalDependantTaskCount) {
                        properties.state = TaskState.CallbackStarted;
                        properties.states.push(properties.state);

                        await properties.callback.call(task, context, data);
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
                if (!properties.error) {
                    properties.error = error;
                }
                properties.state = TaskState.Error;
                properties.states.push(properties.state);
            }
            finally {
                Logging.log(task, `task is at the ${properties.state.toString()} state. Flags: ${task.flags.join(' | ')}`);
                const handleState = () => {
                    Logging.log(task, `task is at the ${properties.state.toString()} state. Flags: ${task.flags.join(' | ')}`);
                    const startTime = properties.time;
                    const endTime = process.hrtime.bigint();
                    const diff = Number((endTime - startTime));
                    if (diff > longRunningMilli) {
                        properties.states.push(TaskState.LongRunning);
                    }
                    if (diff > longRunningTimeoutMilli) {
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
                    Logging.log(task, `task is at the ${properties.state.toString()} state. Flags: ${task.flags.join(' | ')}`);
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
                                handleState();
                                break;
                            } else if (task.hasFlag(TaskFlag.OnceOffDataResolve)) {
                                properties.state = TaskState.Done;
                                properties.states.push(properties.state);
                                taskLoop(100); //no requeue needed the task is done. Carry on processing other tasks.
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
                                taskLoop(100); //no requeue needed the task is done. Carry on processing other tasks.
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
                                privateBag.get(TaskQueue).push(task);
                            } else if (task.hasFlag(TaskFlag.IgnoreErrors)) {
                                console.error(properties.error);
                                privateBag.get(TaskQueue).push(task);
                                taskLoop(100); //current task is in error, but config with don't halt on this error, carry on with other tasks...
                                break;
                            } else {
                                properties.error = new Error(`unable to handle state: ${TaskState.Error.constructor.name}`);
                                privateBag.get(TaskQueue).push(task);
                            }
                            for (const taskWithError of privateBag.get(TaskQueue)) {
                                const { error } = privateBag.get(taskWithError);
                                console.error(error);
                            }
                            break;
                        }
                        case TaskState.LongRunning: {
                            if (task.hasFlag(TaskFlag.RepeatNoDataResolve)) { //no need to wait for the task to call complete
                                task.complete(null);
                                setTimeout(() => handleState(), 1000);
                                break;
                            } else if (task.hasFlag(TaskFlag.RepeatDataResolve)) { //needs to wait for the task to call complete
                                setTimeout(() => handleState(), 1000);
                                break;
                            } else if (task.hasFlag(TaskFlag.OnceOffDataResolve)) {
                                properties.error = new Error(`${task.toString()} task is configured to be once off and to resolve with data, call complete on the task`);
                                properties.state = TaskState.Error;
                                properties.states.push(properties.state);
                                setTimeout(() => handleState(), 1000);
                                break;
                            } else if (task.hasFlag(TaskFlag.OnceOffNoDataResolve)) {
                                task.complete(null);
                                setTimeout(() => handleState(), 1000);
                                break;
                            } else {
                                properties.error = new Error(`unable to handle state: ${TaskState.CallbackReturned.constructor.name}`);
                                properties.state = TaskState.Error;
                                properties.states.push(properties.state);
                                setTimeout(() => handleState(), 1000);
                                break;
                            }
                        }
                        default: {
                            properties.error = new Error('task does not have a state that can be handled');
                            properties.state = TaskState.Error;
                            properties.states.push(properties.state);
                            handleState();
                            break;
                        }
                    }
                    Logging.log(task, `task is at the ${properties.state.toString()} state. Flags: ${task.flags.join(' | ')}`);
                };
                handleState();
            }
        } else {
            if (privateBag.get(TaskQueue).length > 0) {
                for (const taskWithError of privateBag.get(TaskQueue)) {
                    const { error } = privateBag.get(taskWithError);
                    Logging.log(taskWithError, error);
                }
            }
            Logging.log({ Id: 'END' }, `no more tasks in the queues`);
        }
    });
}

export class TaskQueue {
    /**
     * @param { Task } task
    */
    static enqueue(task) {
        const properties = privateBag.get(task);
        const { state, name, contextId, dependencies, callback, resolve } = properties;
        for (const priority of privateBag.get(TaskFlag)) {
            if (task.hasFlag(priority)) {
                properties.state = TaskState.Queued;
                properties.states.push(properties.state);
                let queue = privateBag.get(priority);
                //get the same tasks but executed in a different context
                const matchingTaskInDifferentContext = queue.find(x => x.name === name && x.contextId !== contextId);
                const matchingTaskInSameContext = queue.find(x => x.name === name && x.contextId === contextId && x.Id !== task.Id);
                if ((matchingTaskInDifferentContext || matchingTaskInSameContext) && !isRequeue) {
                    dependencies.push(matchingTaskInDifferentContext);
                    dependencies.push(matchingTaskInSameContext);
                    dependencies = dependencies.filter(d => d);
                    dependencies = new Set(dependencies);
                    dependencies = [...dependencies];
                    queue.push(task);
                } else if (state === TaskState.Requeue || state === TaskState.LongRunning) {
                    queue.push(task);
                } else {
                    queue.unshift(task);
                }
                if (!callback || !resolve) {
                    throw new Error('task was not queued');
                }
                properties.state = TaskState.Ready;
                properties.states.push(properties.state);
                queue = queue.sort((taskA, taskB) => {
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
                privateBag.set(priority, queue);
            }
        }
        taskLoop();
    }
}
privateBag.set(TaskQueue, []); //task error queue
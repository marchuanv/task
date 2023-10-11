import { Task } from '../task.mjs';
import { TaskFlag } from "./task-flag.mjs";
import { TaskProperties } from './task-properties.mjs';
import { TaskState } from './task-state.mjs';

const longRunningMilli = 60000;
let privateBag;
new TaskProperties((_privateBag) => {
    privateBag = _privateBag;
});

privateBag.set(TaskFlag, [ TaskFlag.HighPriority, TaskFlag.MediumPriority,TaskFlag.LowPriority ]);
privateBag.set(TaskFlag.HighPriority, []);
privateBag.set(TaskFlag.MediumPriority, []);
privateBag.set(TaskFlag.LowPriority, []);
privateBag.set(TaskFlag.LowPriority, []);

function taskLoop(loopIntervalMilli = 5000) {
    setTimeout(async () => {
        let queue = privateBag.get(TaskFlag.HighPriority);
        if (queue.length === 0) {
            queue = privateBag.get(TaskFlag.MediumPriority);
            if (queue.length === 0) {
                queue = privateBag.get(TaskFlag.LowPriority);
            }
        }
        if (queue.length > 0) {
            const task = queue.shift();
            const properties = privateBag.get(task);
            const { context, data, dependencies } = properties;
            try {
                if (properties.state === TaskState.Ready) {
                    const nonLongRunningTasks = dependencies.filter(td => td.state !== TaskState.LongRunning);
                    const doneDependantTaskCount = nonLongRunningTasks.filter(td => td.state === TaskState.Done).length;
                    const totalDependantTaskCount = nonLongRunningTasks.length;
                    if (doneDependantTaskCount === totalDependantTaskCount) { //are all the dependencies finished?
                        properties.state = TaskState.CallbackStarted;
                        await properties.callback.call(task, context, data);
                        if (properties.state === TaskState.CallbackStarted) {
                            properties.state = TaskState.CallbackReturned;
                        }
                    } else {
                        properties.state = TaskState.Requeue;
                    }
                } else {
                    properties.state = TaskState.Requeue;
                }
            } catch(error) {
                if (!properties.error) {
                    properties.error = error;
                }
                properties.state = TaskState.Error;
            }
            finally {
                const handleState = () => {
                    switch (task.state) {
                        case TaskState.Requeue: {
                            TaskQueue.enqueue(task);
                            taskLoop(100);
                            return;
                        }
                        case TaskState.Created: {
                            task.error = new Error(`${task.name}(${task.Id}) task is still at the created state`);
                            task.state = TaskState.Error;
                            return handleState();
                        }
                        case TaskState.Ready: {
                            task.error = new Error(`${task.name}(${task.Id}) task is still at the ready state`);
                            task.state = TaskState.Error;
                            return handleState();
                        }
                        case TaskState.PromiseResolvedWithResults: {
                            if (task.hasFlag(TaskFlag.Repeat) || task.hasFlag(TaskFlag.OnceOff) || task.hasFlag(TaskFlag.RepeatUntilValidResponse)) {
                                properties.state = TaskState.Done;
                                taskLoop(100);
                            } else {
                                task.error = new Error(`unable to handle state: ${TaskState.PromiseResolvedWithResults.constructor.name}`);
                                task.state = TaskState.Error;
                                return handleState();
                            }
                            break;
                        }
                        case TaskState.PromiseResolvedNoResults: {
                            if (task.hasFlag(TaskFlag.ValidResponse) || task.hasFlag(TaskFlag.RepeatUntilValidResponse)) {
                                task.error = new Error(`${task.name}(${task.Id}) task completed without a valid response`);
                                task.state = TaskState.Error;
                                return handleState();
                            } else {
                                task.error = new Error(`unable to handle state: ${TaskState.PromiseResolvedNoResults.constructor.name}`);
                                task.state = TaskState.Error;
                                return handleState();
                            }
                            break;
                        }
                        case TaskState.CallbackReturned: {
                            properties.time = properties.time + loopIntervalMilli;
                            if (task.time > longRunningMilli) {
                                properties.state = TaskState.LongRunning;
                                return handleState();
                            }
                            if (task.hasFlag(TaskFlag.WaitForValidResponse)) {
                                return setTimeout(() => handleState(), 1000);
                            } else if (task.hasFlag(TaskFlag.RepeatUntilValidResponse)) {
                                properties.state = TaskState.Requeue;
                                return handleState();
                            } else if (task.hasFlag(TaskFlag.ValidResponse)) {
                                task.error = new Error(`${task.name}(${task.Id}) task was not completed. Config indicated that a valid response is required.`);
                                task.state = TaskState.Error;
                                return handleState();
                            } else {
                                task.error = new Error(`unable to handle state: ${TaskState.CallbackReturned.constructor.name}`);
                                task.state = TaskState.Error;
                                return handleState();
                            }
                            break;
                        }
                        case TaskState.Error: {
                            if (task.hasFlag(TaskFlag.HandleErrors)) {
                                privateBag.get(TaskQueue).push(task);
                                for(const taskError of privateBag.get(TaskQueue)) {
                                    console.error(taskError.error);
                                }
                            } else if (task.hasFlag(TaskFlag.IgnoreErrors)) {
                                console.error(error);
                                privateBag.get(TaskQueue).push(task);
                            } else {
                                task.error = new Error(`unable to handle state: ${TaskState.Error.constructor.name}`);
                                privateBag.get(TaskQueue).push(task);
                                for(const taskError of privateBag.get(TaskQueue)) {
                                    console.error(taskError.error);
                                }
                            }
                            break;
                        }
                        case TaskState.LongRunning: {
                            if (task.hasFlag(TaskFlag.WaitForValidResponse)) {
                                console.log(`${task.name}(${task.Id}) task is a long running task.`);
                                task.state = TaskState.Requeue;
                                return handleState();
                            } else {
                                task.error = new Error(`unable to handle state: ${TaskState.LongRunning.constructor.name}`);
                                task.state = TaskState.Error;
                                return handleState();
                            }
                        }
                        default: {
                            task.error = new Error('task does not have a state that can be handled');
                            task.state = TaskState.Error;
                            return handleState();
                        }
                    }
                };
                handleState();
            }
        } else {
            if (privateBag.get(TaskQueue).length > 0) {
                console.log(`one or more tasks in the queue has errors.`);
                for(const taskError of privateBag.get(TaskQueue)) {
                    console.error(taskError.error);
                }
            }
            console.log(`no more tasks in the queue, exiting process.`);
            process.exit(0);
        }
    }, loopIntervalMilli);
}
taskLoop();

export class TaskQueue {
    /**
     * @param { Task } task
    */
    static enqueue(task) {
        const properties = privateBag.get(task);
        const { state, name, contextId, dependencies, callback, resolve } = properties;
        for(const priority of privateBag.get(TaskFlag)) {
            if (task.hasFlag(priority)) {
                const isRequeue = (
                    state !== TaskState.Created &&
                    state !== TaskState.Ready &&
                    state !== TaskState.Queued
                );
                properties.state = TaskState.Queued;
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
                } else if (isRequeue || state === TaskState.LongRunning) {
                    queue.push(task);
                } else {
                    queue.unshift(task);
                }
                if (!callback || !resolve) {
                    throw new Error('task was not queued');
                }
                properties.state = TaskState.Ready;
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
    }
}
privateBag.set(TaskQueue, []); //task error queue
/**
 * @param { Task } task
 */
function handleTaskState(task) {
   
    }
}


/**
 * @param { Task } taskA
 * @param { Task } taskB
 * @returns { Number }
 */
function taskPrioritySort(taskA, taskB) {
    
}
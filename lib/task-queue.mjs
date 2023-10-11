import { Task } from '../task.mjs';
import { TaskFlag } from "./task-flag.mjs";
import { TaskProperties } from './task-properties.mjs';
import { TaskState } from './task-state.mjs';

let privateBag;
new TaskProperties((_privateBag) => {
    privateBag = _privateBag;
});

const longRunningMilli = 2000000000; //2 seconds for task to become long running

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
            const properties = privateBag.get(task);
            properties.time = process.hrtime.bigint();
            properties.states = new Set(properties.states);
            properties.states = [...properties.states];
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
                const handleState = () => {
                    if (properties.state !== TaskState.LongRunning) {
                        const startTime = properties.time;
                        const endTime = process.hrtime.bigint();
                        const diff = Number((endTime - startTime));
                        if (diff > longRunningMilli) {
                            if (properties.state !== TaskState.Requeue) {
                                properties.state = TaskState.LongRunning;
                                properties.states.push(properties.state);
                            }
                        }
                    }
                    switch (task.state) {
                        case TaskState.Requeue: {
                            TaskQueue.enqueue(task);
                            return;
                        }
                        case TaskState.Created: {
                            task.error = new Error(`${task.name}(${task.Id}) task is still at the created state`);
                            properties.state = TaskState.Error;
                            properties.states.push(properties.state);
                            return handleState();
                        }
                        case TaskState.Ready: {
                            task.error = new Error(`${task.name}(${task.Id}) task is still at the ready state`);
                            properties.state = TaskState.Error;
                            properties.states.push(properties.state);
                            return handleState();
                        }
                        case TaskState.PromiseResolvedWithResults: {
                            if (task.hasFlag(TaskFlag.RepeatNoResponse) || task.hasFlag(TaskFlag.OnceOff) || task.hasFlag(TaskFlag.RepeatUntilValidResponse)) {
                                properties.state = TaskState.Done;
                                properties.states.push(properties.state);
                                return taskLoop(100); //no requeue needed the task is done. Carry on processing other tasks.
                            } else {
                                task.error = new Error(`unable to handle state: ${TaskState.PromiseResolvedWithResults.constructor.name}`);
                                properties.state = TaskState.Error;
                                properties.states.push(properties.state);
                                return handleState();
                            }
                        }
                        case TaskState.PromiseResolvedNoResults: {
                            if (task.hasFlag(TaskFlag.ValidResponse) || task.hasFlag(TaskFlag.RepeatUntilValidResponse)) {
                                task.error = new Error(`${task.name}(${task.Id}) task completed without a valid response`);
                                properties.state = TaskState.Error;
                                properties.states.push(properties.state);
                                return handleState();
                            } else {
                                task.error = new Error(`unable to handle state: ${TaskState.PromiseResolvedNoResults.constructor.name}`);
                                properties.state = TaskState.Error;
                                properties.states.push(properties.state);
                                return handleState();
                            }
                            break;
                        }
                        case TaskState.CallbackReturned: {
                            if (task.hasFlag(TaskFlag.RepeatNoResponse)) {
                                properties.state = TaskState.Requeue;
                                properties.states.push(properties.state);
                                return handleState();
                            } else if (task.hasFlag(TaskFlag.WaitForValidResponse)) {
                                return handleState();
                            } else if (task.hasFlag(TaskFlag.RepeatUntilValidResponse)) {
                                properties.state = TaskState.Requeue;
                                properties.states.push(properties.state);
                                return handleState();
                            } else if (task.hasFlag(TaskFlag.ValidResponse)) {
                                task.error = new Error(`${task.name}(${task.Id}) task was not completed. Config indicated that a valid response is required.`);
                                properties.state = TaskState.Error;
                                properties.states.push(properties.state);
                                return handleState();
                            } else {
                                task.error = new Error(`unable to handle state: ${TaskState.CallbackReturned.constructor.name}`);
                                properties.state = TaskState.Error;
                                properties.states.push(properties.state);
                                return handleState();
                            }
                        }
                        case TaskState.Error: {
                            if (task.hasFlag(TaskFlag.HandleErrors)) {
                                privateBag.get(TaskQueue).push(task);
                            } else if (task.hasFlag(TaskFlag.IgnoreErrors)) {
                                console.error(error);
                                privateBag.get(TaskQueue).push(task);
                                return taskLoop(100); //curre task is in error, but config suggest don't halt on this error. Carry on with other tasks
                            } else {
                                task.error = new Error(`unable to handle state: ${TaskState.Error.constructor.name}`);
                                privateBag.get(TaskQueue).push(task);
                            }
                            for (const _task of privateBag.get(TaskQueue)) {
                                const { error } = privateBag.get(_task);
                                console.error(error);
                            }
                            break;
                        }
                        case TaskState.LongRunning: {
                            if (task.hasFlag(TaskFlag.WaitForValidResponse)) {
                                return setTimeout(() => handleState(), 1000);
                            } else if (task.hasFlag(TaskFlag.RepeatNoResponse)) {
                                properties.state = TaskState.Requeue;
                                properties.states.push(properties.state);
                                return setTimeout(() => handleState(), 1000);
                            } else {
                                task.error = new Error(`unable to handle state: ${TaskState.LongRunning.constructor.name}`);
                                properties.state = TaskState.Error;
                                properties.states.push(properties.state);
                                return handleState();
                            }
                        }
                        default: {
                            task.error = new Error('task does not have a state that can be handled');
                            properties.state = TaskState.Error;
                            properties.states.push(properties.state);
                            return handleState();
                        }
                    }
                };
                handleState();
            }
        } else {
            if (privateBag.get(TaskQueue).length > 0) {
                console.log(`one or more tasks in the queue has errors.`);
                for (const taskError of privateBag.get(TaskQueue)) {
                    console.error(taskError.error);
                }
            }
            console.log(`no more tasks in the queues`);
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
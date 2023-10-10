import { Task } from '../task.mjs';
import { TaskFlag } from "./task-flag.mjs";
import { TaskProperties } from './task-properties.mjs';
import { TaskState } from './task-state.mjs';

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
            try {
                await task.run();
                properties.time = properties.time + queueMilli;
                if (task.time > criteriaLongRunningMilli) {
                    task.state = TaskState.LongRunning;
                }
            } catch(error) {
                task.error = error;
                if (task.hasFlag(TaskFlag.HandleErrors)) {
                    privateBag.get(TaskQueue).push(task);
                    for(const taskError of privateBag.get(TaskQueue)) {
                        console.error(taskError.error);
                    }
                } else {
                    console.error(error);
                    privateBag.get(TaskQueue).push(task);
                    taskLoop(loopIntervalMilli);
                }
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
        const { state, name, context, contextId, dependencies, callback, resolve } = properties;
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
                if (!callback) {
                    throw new Error('task was not queued');
                }
                if (!resolve) {
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
    
}
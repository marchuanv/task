import { Task } from '../task.mjs';
import { TaskContainer } from './task-container.mjs';
import { TaskFlag } from "./task-flag.mjs";
import { TaskRequeueState } from './task-states/task-requeue-state.mjs';

export class TaskQueue extends TaskContainer {
    /**
     * @param { Task } task
    */
    constructor() {
        super(task);
    }
    /**
     * @returns { Boolean }
    */
    get empty() {
        return super.queue.length === 0;
    }
    /**
     * @returns { Array<Task> }
     */
    get queue() {
        return super.queue;
    }
    enqueue() {
        setTimeout(() => {
            super.locked = true;
            //get the same tasks but executed in a different context
            const matchingTaskInDifferentContext = this.queue.find(x =>
                x.name === super.task.name &&
                x.contextId !== super.task.contextId
            );
            const matchingTaskInSameContext = this.queue.find(x =>
                x.name === super.task.name &&
                x.contextId === super.task.contextId &&
                x.Id !== super.task.Id
            );
            const isRequeue = super.taskState.hadState(TaskRequeueState);
            if ((matchingTaskInDifferentContext || matchingTaskInSameContext) && !isRequeue) {
                super.dependencies.push(matchingTaskInDifferentContext);
                super.dependencies.push(matchingTaskInSameContext);
                super.dependencies = super.dependencies.filter(d => d);
                super.dependencies = new Set(super.dependencies);
                super.dependencies = [...super.dependencies];
                this.queue.push(super.task);
            } else if (isRequeue) {
                this.queue.push(task);
            } else {
                this.queue.unshift(task);
            }
            super.enqueueCount = super.enqueueCount + 1;
            super.taskState = super.taskReadyState;
            super.queue = super.queue.sort((taskA, taskB) => {
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
            super.locked = false;
        }, 1000);
    }
    /**
     * @returns { Task }
    */
    dequeue() {
        if (super.highPriorityTaskQueue.empty()) {

        }
    }
}
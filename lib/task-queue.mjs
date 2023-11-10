import {
    Task,
    TaskContainer,
    TaskFlag,
    TaskQueuedState,
    TaskRequeueState
} from "./registry.mjs";

export class TaskQueue extends TaskContainer {
    /**
     * @param { Task } task
    */
    constructor(task) {
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
            const taskState = super.taskState;
            const isRequeue = taskState.hadState(TaskRequeueState);
            if ((matchingTaskInDifferentContext || matchingTaskInSameContext) && !isRequeue) {
                super.dependencies.push(matchingTaskInDifferentContext);
                super.dependencies.push(matchingTaskInSameContext);
                super.dependencies = super.dependencies.filter(d => d);
                super.dependencies = new Set(super.dependencies);
                super.dependencies = [...super.dependencies];
                this.queue.push(super.task);
            } else if (isRequeue) {
                this.queue.push(super.task);
            } else {
                this.queue.unshift(super.task);
            }
            super.enqueueCount = super.enqueueCount + 1;

            if (!taskState.hadState(TaskQueuedState)) {
                taskState = new TaskQueuedState(super.task);
            }

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
        }, 500);
    }
    /**
     * @returns { Task }
    */
    dequeue() {
        if (!super.empty()) {
            return super.queue.shift();
        }
    }
}
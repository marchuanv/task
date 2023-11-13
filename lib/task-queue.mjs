import {
    Task,
    TaskContainer,
    TaskFlag,
    TaskQueuedState
} from "./registry.mjs";

export class TaskQueue extends TaskContainer {
    /**
     * @param { Task } task
    */
    constructor(task) {
        if (new.target === TaskQueue) {
            throw new Error(`${TaskQueue.name} should be extended`);
        }
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
    get sharedQueue() {
        return super.queue;
    }
    enqueue() {
        setTimeout(() => {
            const queueLock = super.queueLock;
            try {
                const task = super.task;
                const taskState = super.taskState;
                const thisId = super.Id;
                if (queueLock.Id) {
                    return this.enqueue();
                }
                queueLock.Id = thisId;
                const taskInDifferentContext = this.sharedQueue.find(x =>
                    x.name === task.name &&
                    x.contextId !== task.contextId
                );
                const taskInSameContext = this.sharedQueue.find(x =>
                    x.name === task.name &&
                    x.contextId === task.contextId &&
                    x.Id !== task.Id
                );
                if ((taskInDifferentContext || taskInSameContext)) {
                    super.dependencies.push(taskInDifferentContext.Id);
                    super.dependencies.push(taskInSameContext.Id);
                    super.dependencies = super.dependencies.filter(d => d); //remove nulls
                    super.dependencies = new Set(super.dependencies);
                    super.dependencies = [...super.dependencies];
                }
                this.sharedQueue.push(task);
                super.enqueueCount = super.enqueueCount + 1;

                if (!taskState.hadState(TaskQueuedState)) {
                    new TaskQueuedState(task);
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
            } finally {
                queueLock.Id = null;
            }
        }, 100);
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
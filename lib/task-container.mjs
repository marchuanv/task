import {
    Bag,
    HighPriorityTaskQueue,
    LowPriorityTaskQueue,
    MediumPriorityTaskQueue,
    Task,
    TaskPromise,
    TaskRunner,
    TaskState,
    TaskStateStack,
    crypto,
    getBag
} from "./registry.mjs";

const globalBag = new Bag();

export class TaskContainer extends Bag {
    /**
     * @param { Task } task
     */
    constructor(task) {

        super();

        if (this instanceof Task) {
            throw new Error(`${Task.name} can't extend ${TaskContainer.name}`);
        }

        const _bag = getBag(task);
        if (!_bag.task) {
            _bag.task = task;
        }
        this.onGet({ task: null }, () => {
            return _bag.task;
        });

        if (!_bag.Id) {
            _bag.Id = crypto.randomUUID();
        }

        if (this instanceof TaskStateStack) {
            _bag.taskStateStack = this;
        }
        this.onGet({ taskStateStack: null }, () => {
            return _bag.taskStateStack;
        });

        if (this instanceof TaskPromise) {
            _bag.taskPromise = this;
        }
        this.onGet({ taskPromise: null }, () => {
            return _bag.taskPromise;
        });

        if (this instanceof TaskRunner) {
            _bag.taskRunner = this;
        }
        this.onGet({ taskRunner: null }, () => {
            return _bag.taskRunner;
        });

        if (this instanceof TaskState) {
            _bag.taskState = this;
        }
        this.onGet({ taskState: null }, () => {
            return _bag.taskState;
        });
        this.onSet({ taskState: null }, (value) => {
            _bag.taskState = value;
        });

        if (this instanceof HighPriorityTaskQueue) {
            if (_bag.taskQueue) {
                throw new Error(`taskQueue has already been set to ${_bag.taskQueue.constructor.name}`);
            }
            _bag.taskQueue = this;
        }
        this.onGet({ highPriorityTaskQueue: null }, () => {
            if (_bag.taskQueue instanceof HighPriorityTaskQueue) {
                return _bag.taskQueue;
            } else {
                throw new Error(`taskQueue is not a ${HighPriorityTaskQueue.name}`);
            }
        });

        if (this instanceof MediumPriorityTaskQueue) {
            if (_bag.taskQueue) {
                throw new Error(`taskQueue has already been set to ${_bag.taskQueue.constructor.name}`);
            }
            _bag.taskQueue = this;
        }
        this.onGet({ mediumPriorityTaskQueue: null }, () => {
            if (_bag.taskQueue instanceof MediumPriorityTaskQueue) {
                return _bag.taskQueue;
            } else {
                throw new Error(`taskQueue is not a ${MediumPriorityTaskQueue.name}`);
            }
        });

        if (this instanceof LowPriorityTaskQueue) {
            if (_bag.taskQueue) {
                throw new Error(`taskQueue has already been set to ${_bag.taskQueue.constructor.name}`);
            }
            _bag.taskQueue = this;
        }
        this.onGet({ lowPriorityTaskQueue: null }, () => {
            if (_bag.taskQueue instanceof LowPriorityTaskQueue) {
                return _bag.taskQueue;
            } else {
                throw new Error(`taskQueue is not a ${LowPriorityTaskQueue.name}`);
            }
        });

        this.onGet({ taskQueue: null }, () => {
            return _bag.taskQueue;
        });

        this.onGet({ queue: null }, () => {
            return globalBag.queue
        });
        _bag.onGet({ queueLock: null }, () => {
            return globalBag.queueLock
        });

        super.Id = crypto.randomUUID();
        Object.seal(this);
    }
}
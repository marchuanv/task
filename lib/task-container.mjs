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
        this.onSet({ task: null }, () => {
            throw new Error('task is ready only');
        });

        if (!_bag.Id) {
            _bag.Id = crypto.randomUUID();
        }

        if (this instanceof TaskStateStack && !_bag.taskStateStack) {
            _bag.taskStateStack = this;
            _bag.onSet({ taskStateStack: null }, () => {
                throw new Error('taskStateStack is ready only');
            });
        }
        this.onGet({ taskStateStack: null }, () => {
            return _bag.taskStateStack;
        });

        if (this instanceof TaskPromise && !_bag.taskPromise) {
            _bag.taskPromise = this;
            _bag.onSet({ taskPromise: null }, () => {
                throw new Error('taskPromise is ready only');
            });
        }
        this.onGet({ taskPromise: null }, () => {
            return _bag.taskPromise;
        });

        if (this instanceof TaskRunner && !_bag.taskRunner) {
            _bag.taskRunner = this;
            _bag.onSet({ taskRunner: null }, () => {
                throw new Error('taskRunner is ready only');
            });
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
            _bag.onSet({ taskQueue: null }, () => {
                throw new Error('taskQueue is ready only');
            });
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
            _bag.onSet({ taskQueue: null }, () => {
                throw new Error('taskQueue is ready only');
            });
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
            _bag.onSet({ taskQueue: null }, () => {
                throw new Error('taskQueue is ready only');
            });
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
        this.onSet({ taskQueue: null }, () => {
            throw new Error('taskQueue is ready only');
        });

        this.onGet({ queue: null }, () => {
            return globalBag.queue
        });
        this.onSet({ queue: null }, () => {
            throw new Error('queue is ready only');
        });

        _bag.onGet({ queueLock: null }, () => {
            return globalBag.queueLock
        });
        this.onSet({ queueLock: null }, () => {
            throw new Error('queueLock is ready only');
        });

        super.timeout = _bag.timeout;
        super.flags = _bag.flags;
        super.Id = crypto.randomUUID();
        Object.seal(this);
    }
}
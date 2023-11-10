import {
    HighPriorityTaskQueue,
    LowPriorityTaskQueue,
    MediumPriorityTaskQueue,
    TaskCreatedState,
    TaskFlag,
    TaskFlagGroup,
    TaskPromise,
    TaskRunner,
    TaskState,
    TaskStateStack,
    getBag
} from "./lib/registry.mjs";

export class Task {
    /**
     * @param { String } name
     * @param { Object } context
     * @param { Object } data
     * @param { Object } timeoutMilli
     * @param { Array<TaskFlag> } flags
    */
    constructor(name, context, data, timeoutMilli, flags = []) {
        const bag = getBag(this);
        bag.name = name;
        bag.context = context;
        bag.contextId = context.Id;
        bag.data = data;
        bag.timeoutMilli = timeoutMilli;
        bag.flags = flags;
        bag.taskStateStack = new TaskStateStack(this);
        bag.taskState = new TaskCreatedState(this);
        bag.taskRunner = new TaskRunner(this);
        bag.taskPromise = new TaskPromise(this);
        if (!this.hasFlagGroup(TaskFlagGroup.Priority)) {
            bag.flags.push(TaskFlag.LowPriority);
        }
        if (!this.hasFlagGroup(TaskFlagGroup.ErrorHandling)) {
            bag.flags.push(TaskFlag.HandleErrors);
        }
        if (!this.hasFlagGroup(TaskFlagGroup.Run)) {
            bag.flags.push(TaskFlag.OnceOffWithOutput);
        }
        if (this.hasFlag([TaskFlag.HighPriority])) {
            bag.taskRunner.taskQueue = new HighPriorityTaskQueue(this);
        }
        if (this.hasFlag([TaskFlag.MediumPriority])) {
            bag.taskRunner.taskQueue = new MediumPriorityTaskQueue(this);
        }
        if (this.hasFlag([TaskFlag.LowPriority])) {
            bag.taskRunner.taskQueue = new LowPriorityTaskQueue(this);
        }
    }
    /**
     * @param { String } name,
     * @param { class } context
     * @param { Object } data
     * @param { Number } timeoutMilli
     * @param { Array<TaskFlag> } flags
     * @returns { Task }
    */
    static create(name, context, data, timeoutMilli, flags = []) {
        return new Task(name, context, data, timeoutMilli, flags);
    }
    /**
     * @param { T } type
     * @param { Function } callback
     * @returns { Promise<T> }
    */
    run(type, callback) {
        const bag = getBag(this);
        bag.callback = callback;
        bag.taskQueue.callback = callback;
        bag.taskRunner.callback = callback;
        bag.taskQueue.enqueue();
        bag.taskRunner.run();
        return bag.taskPromise.get();
    }
    /**
     * @returns { String }
    */
    get Id() {
        return getBag(this).Id;
    }
    /**
     * @returns { String }
    */
    get contextId() {
        return getBag(this).contextId;
    }
    /**
     * @returns { String }
    */
    get name() {
        return getBag(this).name;
    }
    /**
     * @returns { TaskState }
    */
    get state() {
        return getBag(this).taskStateStack.peek();
    }
    /**
     * @param { Object }
    */
    complete(data) {
        getBag(this).data = data;
    }

    /**
     * @param { Array<TaskFlag> } _flags
     * @returns { Boolean }
    */
    hasFlag(_flags = []) {
        if (!Array.isArray(_flags)) {
            _flags = [_flags];
        }
        for (const flag of getBag(this).flags) {
            if (_flags.find(_flag => _flag === flag)) {
                return true;
            }
        }
        return false;
    }
    /**
     * @returns { Array<string> } _flags
    */
    get flags() {
        return getBag(this).flags.map(f => f.toString());
    }
    /**
     * @param { TaskFlagGroup } flagGroup
     * @returns { Boolean }
    */
    hasFlagGroup(flagGroup) {
        for (const _flag of getBag(this).flags) {
            if (_flag.group === flagGroup) {
                return true;
            }
        }
        return false;
    }
    /**
     * @returns { String }
    */
    toString() {
        return `${getBag(this).contextId}: ${getBag(this).name}(${getBag(this).Id})`;
    }
    /**
     * @returns { Number }
    */
    get enqueueCount() {
        return getBag(this).enqueueCount;
    }
    /**
     * @returns { Number }
    */
    get startTime() {
        return getBag(this).startTime;
    }
    /**
     * @returns { Number }
    */
    get endTime() {
        return getBag(this).endTime;
    }
    /**
     * @returns { Error }
    */
    get error() {
        return getBag(this).error;
    }
    /**
     * @returns { Object }
    */
    get data() {
        return getBag(this).data;
    }
}

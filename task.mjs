import { TaskFlagGroup } from './lib/task-flag-group.mjs';
import { TaskFlag } from "./lib/task-flag.mjs";
import { TaskProperties } from "./lib/task-properties.mjs";
import { TaskQueue } from './lib/task-queue.mjs';
import { TaskState } from './lib/task-state.mjs';
let privateBag = new WeakMap();
export class Task {
    /**
     * @param { String } name
     * @param { Object } context
     * @param { Object } data
     * @param { Object } timeoutMilli
     * @param { Array<TaskFlag> } flags
    */
    constructor(name, context, data, timeoutMilli, flags = []) {
        const properties = new TaskProperties(name, context, data, timeoutMilli, flags, this);
        Object.seal(properties);
        privateBag.set(this, properties);
        if (!this.hasFlagGroup(TaskFlagGroup.Priority)) {
            properties.flags.push(TaskFlag.LowPriority);
        }
        if (!this.hasFlagGroup(TaskFlagGroup.ErrorHandling)) {
            properties.flags.push(TaskFlag.HandleErrors);
        }
        if (!this.hasFlagGroup(TaskFlagGroup.Run)) {
            properties.flags.push(TaskFlag.OnceOffWithOutput);
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
        const properties = privateBag.get(this);
        properties.stack = (new Error()).stack;
        properties.callback = callback;
        TaskQueue.enqueue(this, properties);
        return properties.promise.get();
    }
    /**
     * @returns { TaskState }
    */
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    /**
     * @returns { TaskState }
    */
    get contextId() {
        const { contextId } = privateBag.get(this);
        return contextId;
    }
    /**
     * @returns { TaskState }
    */
    get name() {
        const { name } = privateBag.get(this);
        return name;
    }
    /**
     * @returns { TaskState }
    */
    get state() {
        const { state } = privateBag.get(this);
        return state;
    }
    /**
     * @param { Object }
    */
    complete(data) {
        const properties = privateBag.get(this);
        properties.data = data;
        if (properties.data === undefined || properties.data === null) {
            properties.state = TaskState.PromiseResolvedNoData;
        } else {
            properties.state = TaskState.PromiseResolvedWithData;
        }
    }
    /**
     * @param { TaskState } state
     * @returns { Boolean }
    */
    hadState(state) {
        const { stateHistory } = privateBag.get(this);
        for (const _state of stateHistory) {
            if (_state === state) {
                return true;
            }
        }
        return false;
    }
    /**
     * @param { Array<TaskFlag> } _flags
     * @returns { Boolean }
    */
    hasFlag(_flags = []) {
        if (!Array.isArray(_flags)) {
            _flags = [_flags];
        }
        const { flags } = privateBag.get(this);
        for (const flag of flags) {
            if (_flags.find(_flag => _flag === flag)) {
                return true;
            }
        }
        return false;
    }
    get flags() {
        const { flags } = privateBag.get(this);
        const _flags = flags.map(f => f.toString());
        return _flags;
    }
    /**
     * @param { TaskFlagGroup } flagGroup
     * @returns { Boolean }
    */
    hasFlagGroup(flagGroup) {
        const { flags } = privateBag.get(this);
        for (const _flag of flags) {
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
        return `${this.contextId}: ${this.name}(${this.Id})`;
    }
    /**
     * @returns { Number }
    */
    get enqueueCount() {
        const { enqueueCount } = privateBag.get(this);
        return enqueueCount;
    }
    /**
     * @returns { Number }
    */
    get startTime() {
        const { startTime } = privateBag.get(this);
        return startTime;
    }
    /**
     * @returns { Number }
    */
    get endTime() {
        const { endTime } = privateBag.get(this);
        return endTime;
    }
    /**
     * @returns { Error }
    */
    get error() {
        const { error } = privateBag.get(this);
        return error;
    }
    /**
     * @returns { Object }
    */
    get data() {
        const { data } = privateBag.get(this);
        return data;
    }
}

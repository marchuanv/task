import crypto from 'node:crypto';
import { TaskFlagGroup } from './lib/task-flag-group.mjs';
import { TaskFlag } from "./lib/task-flag.mjs";
import { TaskProperties } from './lib/task-properties.mjs';
import { TaskQueue } from './lib/task-queue.mjs';
import { TaskState } from './lib/task-state.mjs';
let privateBag;
export class Task extends TaskProperties {
    /**
     * @param { String } name
     * @param { Object } context
     * @param { Object } data
     * @param { Array<TaskFlag> } flags
    */
    constructor(name, context, data, flags = []) {
        if (!name) {
            throw new Error(`no name argument`);
        }
        if (!context) {
            throw new Error(`no context argument`);
        }
        if (!context.Id) {
            throw new Error(`context argument does not have an Id field.`);
        }
        let _properties = {};
        _properties.context = context;
        _properties.name = `${context.constructor.name}_${name}`;
        _properties.contextId = context.Id;
        _properties.flags = flags;
        _properties.error = null;
        _properties.callback = null;
        _properties.state = TaskState.Created;
        _properties.data = data;
        _properties.states = [_properties.state];
        _properties.Id = crypto.randomUUID();
        _properties.startTime = 0;
        _properties.endTime = 0;
        _properties.enqueueCount = 0;
        _properties.dependencies = [];
        _properties.stack = null;
        _properties.reject = () => { console.log('queue the task first'); };
        _properties.resolve = () => { console.log('queue the task first'); };
        super((_privateBag) => {
            privateBag = _privateBag;
        });
        privateBag.set(this, _properties);
        if (!this.hasFlagGroup(TaskFlagGroup.Priority)) {
            _properties.flags.push(TaskFlag.LowPriority);
        }
        if (!this.hasFlagGroup(TaskFlagGroup.ErrorHandling)) {
            _properties.flags.push(TaskFlag.HandleErrors);
        }
        if (!this.hasFlagGroup(TaskFlagGroup.Run)) {
            _properties.flags.push(TaskFlag.OnceOffDataResolve);
        }
    }
    /**
     * @param { String } name,
     * @param { class } context
     * @param { Object } data
     * @param { Array<TaskFlag> } flags
     * @returns { Task }
    */
    static create(name, context, data, flags = []) {
        return new Task(name, context, data, flags);
    }
    /**
     * @param { T } type
     * @param { Function } callback
     * @returns { Promise<T> }
    */
    queue(type, callback) {
        const properties = privateBag.get(this);
        properties.stack = (new Error()).stack;
        properties.callback = callback;
        return new Promise((resolve, reject) => {
            properties.resolve = resolve;
            properties.reject = reject;
            TaskQueue.enqueue(this);
        });
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
    complete(value) {
        const properties = privateBag.get(this);
        if (properties.resolve) {
            properties.value = value;
            if (properties.value === undefined || properties.value === null) {
                properties.state = TaskState.PromiseResolvedNoResults;
                properties.states.push(properties.state);
            } else {
                properties.state = TaskState.PromiseResolvedWithResults;
                properties.states.push(properties.state);
            }
        } else {
            properties.state = TaskState.Error;
            properties.states.push(properties.state);
            properties.error = new Error(`critical error, complete task was called without a promise resolve function`);
        }
    }
    /**
    * @param { TaskState } state
    * @returns { Boolean }
   */
    hadState(state) {
        const { states } = privateBag.get(this);
        for (const _state of states) {
            if (_state === state) {
                return true;
            }
        }
        return false;
    }
    /**
     * @param { TaskFlag } flag
     * @returns { Boolean }
    */
    hasFlag(flag) {
        const { flags } = privateBag.get(this);
        for (const _flag of flags) {
            if (flag === _flag) {
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
    enqueueCount() {
        const { enqueueCount } = privateBag.get(this);
        return enqueueCount;
    }
    /**
     * @returns { Number }
    */
    startTime() {
        const { startTime } = privateBag.get(this);
        return startTime;
    }
    /**
     * @returns { Number }
    */
    endTime() {
        const { endTime } = privateBag.get(this);
        return endTime;
    }
}

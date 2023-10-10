import crypto from 'node:crypto';
import { TaskFlag } from "./lib/task-flag.mjs";
import { TaskState } from './lib/task-state.mjs';
import { TaskFlagGroup } from './lib/task-flag-group.mjs';
import { TaskQueue } from './lib/task-queue.mjs';
import { TaskProperties } from './lib/task-properties.mjs';
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
        _properties.history = [];
        _properties.Id = crypto.randomUUID();
        _properties.time = 0;
        _properties.dependencies = [];
        _properties.stack = null;
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
            _properties.flags.push(TaskFlag.OnceOff);
        }
        if (!this.hasFlagGroup(TaskFlagGroup.Response)) {
            _properties.flags.push(TaskFlag.ValidResponse);
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
        properties.callback = callback;
        return new Promise((resolve) => {
            const properties = privateBag.get(this);
            properties.resolve = resolve;
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
    get state() {
        const { state } = privateBag.get(this);
        return state;
    }
    async run() {
        const properties = privateBag.get(this);
        const { context, data, dependencies } = properties;
        properties.stack = (new Error()).stack;
        if (this.state === TaskState.Ready) {
            const nonLongRunningTasks = dependencies.filter(td => td.state !== TaskState.LongRunning);
            const doneDependantTaskCount = nonLongRunningTasks.filter(td => td.state === TaskState.Done).length;
            const totalDependantTaskCount = nonLongRunningTasks.length;
            if (doneDependantTaskCount !== totalDependantTaskCount) { //are all the dependencies finished?
                TaskQueue.enqueue(this);
            } else {
                properties.state = TaskState.CallbackStarted;
                await properties.callback.call(this, context, data);
                if (this.state === TaskState.CallbackStarted) {
                    properties.state = TaskState.CallbackReturned;
                }
            }
        } else {
            TaskQueue.enqueue(this);
        }
    }
    /**
     * @param { Object }
    */
    complete(value) {
        const properties = privateBag.get(this);
        if (properties.resolve) {
            properties.value = value;
            properties.resolve(properties.value);
            if (properties.value === undefined || properties.value === null) {
                properties.state = TaskState.PromiseResolvedNoResults;
            } else {
                properties.state = TaskState.PromiseResolvedWithResults;
            }
        } else {
            properties.state = TaskState.Error;
            throw new Error(`critical error, complete task was called without a promise resolve function`);
        }
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
}

import crypto from 'node:crypto';
import { Task } from '../task.mjs';
import { TaskFlag } from "./task-flag.mjs";
import { TaskLogging } from './task-logging.mjs';
import { TaskPromise } from './task-promise.mjs';
import { TaskState } from './task-state.mjs';
let privateBag = new WeakMap();
export class TaskProperties {
    /**
     * @param { String } name
     * @param { Object } context
     * @param { Object } data
     * @param { Object } timeoutMilli
     * @param { Array<TaskFlag> } flags
     * @param { Task } task
    */
    constructor(name, context, data, timeoutMilli, flags, task) {
        if (!name) {
            throw new Error(`no name argument`);
        }
        if (!context) {
            throw new Error(`no context argument`);
        }
        if (!context.Id) {
            throw new Error(`context argument does not have an Id field.`);
        }
        const properties = {};
        privateBag.set(this, properties);
        properties.Id = crypto.randomUUID();
        properties.error = null;
        properties.timeout = (timeoutMilli * 1000000);
        properties.name = `${context.constructor.name}_${name}`;
        properties.contextId = context.Id;
        properties.flags = flags;
        properties.callback = null;
        properties.state = TaskState.Created;
        properties.data = data;
        properties.stateHistory = [properties.state];
        properties.startTime = 0;
        properties.endTime = 0;
        properties.enqueueCount = 0;
        properties.dependencies = [];
        properties.stack = null;
        properties.promise = new TaskPromise(this);
        properties.task = task;
        Object.seal(properties);
    }
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    /**
     * @returns { String }
    */
    get contextId() {
        const { contextId } = privateBag.get(this);
        return contextId;
    }
    /**
     * @returns { String }
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
     * @param { TaskState }
    */
    set state(value) {
        const { stateHistory, task } = privateBag.get(this);
        const vars = privateBag.get(this);
        vars.state = value;
        const exists = stateHistory.find(s => s === value);
        if (!exists) {
            stateHistory.push(value);
        }
        TaskLogging.log(task, `State Change: ${task.state.toString()}`);
    }
    /**
     * @returns { Array<TaskFlag> }
    */
    get flags() {
        const { flags } = privateBag.get(this);
        return flags;
    }
    /**
     * @returns { Number }
    */
    get enqueueCount() {
        const { enqueueCount } = privateBag.get(this);
        return enqueueCount;
    }
    /**
     * @param { Number }
    */
    set enqueueCount(value) {
        const vars = privateBag.get(this);
        vars.enqueueCount = value;
    }
    /**
     * @returns { Number }
    */
    get startTime() {
        const { startTime } = privateBag.get(this);
        return startTime;
    }
    /**
     * @param { Number }
    */
    set startTime(value) {
        const vars = privateBag.get(this);
        return vars.startTime = value;
    }
    /**
     * @returns { Number }
    */
    get endTime() {
        const { endTime } = privateBag.get(this);
        return endTime;
    }
    /**
     * @param { Number }
    */
    set endTime(value) {
        const vars = privateBag.get(this);
        return vars.endTime = value;
    }
    /**
     * @returns { Error }
    */
    get error() {
        const { error } = privateBag.get(this);
        return error;
    }
    /**
     * @param { Error }
    */
    set error(value) {
        const vars = privateBag.get(this);
        return vars.error = value;
    }
    /**
     * @returns { Object }
    */
    get data() {
        const { data } = privateBag.get(this);
        return data;
    }
    /**
     * @param { Object }
    */
    set data(value) {
        const vars = privateBag.get(this);
        return vars.data = value;
    }
    /**
     * @returns { Array<Task> }
    */
    get dependencies() {
        const { dependencies } = privateBag.get(this);
        return dependencies;
    }
    /**
     * @param { Array<Task> }
    */
    set dependencies(value) {
        const vars = privateBag.get(this);
        return vars.dependencies = value;
    }
    /**
     * @returns { Number }
    */
    get timeout() {
        const { timeout } = privateBag.get(this);
        return timeout;
    }
    /**
     * @returns { Function }
    */
    get callback() {
        const { callback } = privateBag.get(this);
        return callback;
    }
    /**
     * @param { Function }
    */
    set callback(value) {
        const vars = privateBag.get(this);
        return vars.callback = value;
    }
    /**
     * @returns { Array<TaskState> }
    */
    get stateHistory() {
        const { stateHistory } = privateBag.get(this);
        return stateHistory;
    }
    /**
     * @returns { TaskPromise }
    */
    get promise() {
        const { promise } = privateBag.get(this);
        return promise;
    }
    /**
     * @returns { String }
    */
    get stack() {
        const { stack } = privateBag.get(this);
        return stack;
    }
    /**
     * @param { String }
    */
    set stack(value) {
        const vars = privateBag.get(this);
        vars.stack = value;
    }
}

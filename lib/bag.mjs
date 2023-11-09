import { Task } from "../task.mjs";
import { TaskPromise } from "./task-promise.mjs";
import { TaskProperties } from "./task-properties.mjs";
import { TaskQueue } from "./task-queue.mjs";
import { HighPriorityTaskQueue } from "./task-queues/high-priority-task-queue.mjs";
import { LowPriorityTaskQueue } from "./task-queues/low-priority-task-queue.mjs";
import { MediumPriorityTaskQueue } from "./task-queues/medium-priority-task-queue.mjs";
import { TaskRunner } from "./task-runner.mjs";
import { TaskStateStack } from "./task-state-stack.mjs";
import { TaskState } from "./task-state.mjs";
import { TaskCallbackState } from "./task-states/task-callback-state.mjs";
import { TaskCreatedState } from "./task-states/task-created-state.mjs";

export class Bag {
    constructor() {
        this._Id = null;
        this._error = null;
        this._timeout = null;
        this._name = null;
        this._contextId = null;
        this._callback = null;
        this._data = data;
        this._startTime = null;
        this._endTime = null;
        this._enqueueCount = null;
        this._flags = new Array();
        this._dependencies = new Array();
        this._promise = null;
        this._promises = new Array();
        this._isResolved = false;
        this._isRejected = false;
        this._isHandledPromise = false;
        this._resolve = null;
        this._reject = null;
        this._stack = new Array();
        this._context = null;
        this.taskStateType = null;
        this._taskProperties = null;
        this._taskQueue = null;
        this._taskState = null;
        this._taskStateStack = _taskStateStack;
        this._taskPromises = new Array();
        this._taskCallbackState = null;
        this._taskCreatedState = null;
        this._taskReadyState = null;
        this._taskRequeueState = null;
        this.taskWaitForPromiseState = null;
        this._taskRunner = null;
        this._highPriorityTaskQueue = null;
        this._mediumPriorityTaskQueue = null;
        this._lowPriorityTaskQueue = null;
        this._task = null;
        this._queue = new Array();
        this._locked = null;
        Object.seal(this);
    }
    /**
     * @param { Bag } bag
     */
    sync(bag) {
        const keys = Object.getOwnPropertyNames();
        for (const key of keys) {
            this[key] = bag[key];
        }
    }
    /**
     * @returns { String }
    */
    get Id() {
        return this._Id;
    }
    /**
     * @param { String } value
    */
    set Id(value) {
        this._Id = value;
    }
    /**
     * @returns { Error }
    */
    get error() {
        return this._error;
    }
    /**
     * @param { Error } value
    */
    set error(value) {
        this._error = value;
    }
    /**
     * @returns { Number }
    */
    get timeout() {
        return this._timeout;
    }
    /**
     * @param { Number } value
    */
    set timeout(value) {
        this._timeout = value;
    }
    /**
     * @returns { String }
    */
    get name() {
        return this._name;
    }
    /**
     * @param { String } value
    */
    set name(value) {
        this._name = value;
    }
    /**
     * @returns { String }
    */
    get contextId() {
        return this._contextId;
    }
    /**
     * @param { String } value
    */
    set contextId(value) {
        this._contextId = value;
    }
    /**
    * @returns { Function }
    */
    get callback() {
        return this._callback;
    }
    /**
     * @param { Function } value
    */
    set callback(value) {
        this._callback = value;
    }
    /**
     * @returns { Object }
    */
    get data() {
        return this._data;
    }
    /**
     * @param { Object } value
    */
    set data(value) {
        this._data = value;
    }
    /**
     * @returns { Number }
    */
    get startTime() {
        return this._startTime;
    }
    /**
     * @param { Number } value
    */
    set startTime(value) {
        this._startTime = value;
    }
    /**
     * @returns { Number }
    */
    get endTime() {
        return this._endTime;
    }
    /**
     * @param { Number } value
    */
    set endTime(value) {
        this._endTime = value;
    }
    /**
     * @returns { Number }
    */
    get enqueueCount() {
        return this._enqueueCount;
    }
    /**
     * @param { Number } value
    */
    set enqueueCount(value) {
        this._enqueueCount = value;
    }
    /**
     * @returns { Array }
    */
    get flags() {
        return this._flags;
    }
    /**
     * @param { Array } value
    */
    set flags(value) {
        this._flags = value;
    }
    /**
     * @returns { Array }
    */
    get dependencies() {
        return this._dependencies;
    }
    /**
     * @param { Array } value
    */
    set dependencies(value) {
        this._dependencies = value;
    }
    /**
     * @returns { Promise }
    */
    get promise() {
        return this._promise;
    }
    /**
     * @param { Promise } value
    */
    set promise(value) {
        this._promise = value;
    }
    /**
     * @returns { Array<Promise> }
    */
    get promises() {
        return this._promises;
    }
    /**
     * @param { Array<Promise> } value
    */
    set promises(value) {
        this._promises = value;
    }
    /**
     * @returns { Boolean }
    */
    get isResolved() {
        return this._isResolved;
    }
    /**
     * @param { Boolean } value
    */
    set isResolved(value) {
        this._isResolved = value;
    }
    /**
     * @returns { Boolean }
    */
    get isRejected() {
        return this._isRejected;
    }
    /**
     * @param { Boolean } value
    */
    set isRejected(value) {
        this._isRejected = value;
    }
    /**
     * @returns { Boolean }
    */
    get isHandledPromise() {
        return this._isHandledPromise;
    }
    /**
     * @param { Boolean } value
    */
    set isHandledPromise(value) {
        this._isHandledPromise = value;
    }
    /**
     * @returns { Function }
    */
    get resolve() {
        return this._resolve;
    }
    /**
     * @param { Function } value
    */
    set resolve(value) {
        this._resolve = value;
    }
    /**
     * @returns { Function }
    */
    get reject() {
        return this._reject;
    }
    /**
     * @param { Function } value
    */
    set reject(value) {
        this._reject = value;
    }
    /**
     * @returns { Array }
    */
    get stack() {
        return this._stack;
    }
    /**
     * @param { Array } value
    */
    set stack(value) {
        this._stack = value;
    }
    /**
     * @returns { Object }
    */
    get context() {
        return this._context;
    }
    /**
     * @param { Object } value
    */
    set context(value) {
        this._context = value;
    }
    /**
     * @returns { Object }
    */
    get taskStateType() {
        return this._taskStateType;
    }
    /**
     * @param { Object }
    */
    set taskStateType(value) {
        this._taskStateType = value;
    }
    /**
     * @returns { TaskProperties }
    */
    get taskProperties() {
        return this._taskProperties;
    }
    /**
     * @param { TaskProperties }
    */
    set taskProperties(value) {
        this._taskProperties = value;
    }
    /**
     * @returns { TaskQueue }
    */
    get taskQueue() {
        return this._taskQueue;
    }
    /**
     * @param { TaskQueue }
    */
    set taskQueue(value) {
        this._taskQueue = value;
    }
    /**
     * @returns { TaskState }
    */
    get taskState() {
        return this._taskState;
    }
    /**
     * @param { TaskState }
    */
    set taskState(value) {
        this._taskState = value;
    }
    /**
     * @returns { TaskStateStack }
    */
    get taskStateStack() {
        return this._taskStateStack;
    }
    /**
     * @param { TaskStateStack }
    */
    set taskStateStack(value) {
        this._taskStateStack = value;
    }
    /**
     * @returns { Array<TaskPromise> }
    */
    get taskPromises() {
        return this._taskPromises;
    }
    /**
     * @param { Array<TaskPromise> }
    */
    set taskPromises(value) {
        this._taskPromises = value;
    }
    /**
     * @returns { TaskCallbackState }
    */
    get taskCallbackState() {
        return this._taskCallbackState;
    }
    /**
     * @param { TaskCallbackState }
    */
    set taskCallbackState(value) {
        this._taskCallbackState = value;
    }
    /**
     * @returns { TaskCreatedState }
    */
    get taskCreatedState() {
        return this._taskCreatedState;
    }
    /**
     * @param { TaskCreatedState }
    */
    set taskCreatedState(value) {
        this._taskCreatedState = value;
    }
    /**
     * @returns { TaskReadyState }
    */
    get taskReadyState() {
        return this._taskReadyState;
    }
    /**
     * @param { TaskReadyState }
    */
    set taskReadyState(value) {
        this._taskReadyState = value;
    }
    /**
     * @returns { TaskRequeueState }
    */
    get taskRequeueState() {
        return this._taskRequeueState;
    }
    /**
     * @param { TaskRequeueState }
    */
    set taskRequeueState(value) {
        this._taskRequeueState = value;
    }
    /**
     * @returns { TaskWaitForPromiseState }
    */
    get taskWaitForPromiseState() {
        return this._taskWaitForPromiseState;
    }
    /**
     * @param { TaskWaitForPromiseState }
    */
    set taskWaitForPromiseState(value) {
        this._taskWaitForPromiseState = value;
    }
    /**
     * @returns { TaskRunner }
    */
    get taskRunner() {
        return this._taskRunner;
    }
    /**
     * @param { TaskRunner }
    */
    set taskRunner(value) {
        this._taskRunner = value;
    }
    /**
     * @returns { HighPriorityTaskQueue }
    */
    get highPriorityTaskQueue() {
        return this._highPriorityTaskQueue;
    }
    /**
     * @param { HighPriorityTaskQueue }
    */
    set highPriorityTaskQueue(value) {
        this._highPriorityTaskQueue = value;
    }
    /**
     * @returns { MediumPriorityTaskQueue }
    */
    get mediumPriorityTaskQueue() {
        return this._mediumPriorityTaskQueue;
    }
    /**
     * @param { MediumPriorityTaskQueue }
    */
    set mediumPriorityTaskQueue(value) {
        this._mediumPriorityTaskQueue = value;
    }
    /**
     * @returns { LowPriorityTaskQueue }
    */
    get lowPriorityTaskQueue() {
        return this._lowPriorityTaskQueue;
    }
    /**
     * @param { LowPriorityTaskQueue }
    */
    set lowPriorityTaskQueue(value) {
        this._lowPriorityTaskQueue = value;
    }
    /**
     * @returns { Task }
    */
    get task() {
        return this._task;
    }
    /**
     * @param { Task }
    */
    set task(value) {
        this._task = value;
    }
    /**
     * @returns { Array }
    */
    get queue() {
        return this._queue;
    }
    /**
     * @param { Array } value
    */
    set queue(value) {
        this._queue = value;
    }
    /**
     * @returns { Boolean }
    */
    get locked() {
        return this._locked;
    }
    /**
     * @param { Boolean } value
    */
    set locked(value) {
        this._locked = value;
    }
}


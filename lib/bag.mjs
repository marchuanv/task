import {
    HighPriorityTaskQueue,
    LowPriorityTaskQueue,
    MediumPriorityTaskQueue,
    Task,
    TaskCallbackState,
    TaskCreatedState,
    TaskPromise,
    TaskQueue,
    TaskQueuedState,
    TaskRequeueState,
    TaskRunner,
    TaskState,
    TaskStateStack,
    TaskWaitForPromiseState
} from "./registry.mjs";

export class Bag {
    constructor() {
        this._Id = null;
        this._error = null;
        this._timeout = null;
        this._name = null;
        this._contextId = null;
        this._callback = null;
        this._data = null;
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
        this._taskStateType = null;
        this._taskProperties = null;
        this._taskQueue = null;
        this._taskState = null;
        this._taskStateStack = null;
        this._taskPromises = new Array();
        this._taskCallbackState = null;
        this._taskCreatedState = null;
        this._taskQueuedState = null;
        this._taskRequeueState = null;
        this._taskWaitForPromiseState = null;
        this._taskRunner = null;
        this._highPriorityTaskQueue = null;
        this._mediumPriorityTaskQueue = null;
        this._lowPriorityTaskQueue = null;
        this._task = null;
        this._queue = new Array();
        this._queueLock = { Id: null };
        this._stackLock = { Id: null };
        this._timeoutMilli = null;
        this._taskPromise = null;
        this._state = null;
        this._isTimeout = false;
        this._getters = [];
        this._setters = [];
        Object.seal(this);
    }
    getter(key) {
        let _key = key;
        if (!_key.startsWith('_')) {
            _key = `_${_key}`;
        }
        if (this[_key] === undefined) {
            throw new Error(`${_key} key was not found in bag`);
        }
        const { callback } = this._getters.find(x => x.key === _key) || {};
        if (callback) {
            return callback();
        } else {
            return this[_key];
        }
    }
    setter(key, value) {
        let _key = key;
        if (!_key.startsWith('_')) {
            _key = `_${_key}`;
        }
        if (this[_key] === undefined) {
            throw new Error(`${_key} key was not found in bag`);
        }
        const { callback } = this._setters.find(x => x.key === _key) || {};
        if (callback) {
            callback(value);
        } else {
            this[_key] = value;
        }
    }
    /**
     * @returns { String }
    */
    get Id() {
        return this.getter('_Id');
    }
    /**
     * @param { String } value
    */
    set Id(value) {
        this.setter('_Id', value);
    }
    /**
     * @returns { Error }
    */
    get error() {
        return this.getter('_error');
    }
    /**
     * @param { Error } value
    */
    set error(value) {
        this.setter('_error', value);
    }
    /**
     * @returns { Number }
    */
    get timeout() {
        return this.getter('_timeout');
    }
    /**
     * @param { Number } value
    */
    set timeout(value) {
        this.setter('_timeout', value);
    }
    /**
     * @returns { String }
    */
    get name() {
        return this.getter('_name');
    }
    /**
     * @param { String } value
    */
    set name(value) {
        this.setter('_name', value);
    }
    /**
     * @returns { String }
    */
    get contextId() {
        return this.getter('_contextId');
    }
    /**
     * @param { String } value
    */
    set contextId(value) {
        this.setter('_contextId', value);
    }
    /**
    * @returns { Function }
    */
    get callback() {
        return this.getter('_callback');
    }
    /**
     * @param { Function } value
    */
    set callback(value) {
        this.setter('_callback', value);
    }
    /**
     * @returns { Object }
    */
    get data() {
        return this.getter('_data');
    }
    /**
     * @param { Object } value
    */
    set data(value) {
        this.setter('_data', value);
    }
    /**
     * @returns { Number }
    */
    get startTime() {
        return this.getter('_startTime');
    }
    /**
     * @param { Number } value
    */
    set startTime(value) {
        this.setter('_startTime', value);
    }
    /**
     * @returns { Number }
    */
    get endTime() {
        return this.getter('_endTime');
    }
    /**
     * @param { Number } value
    */
    set endTime(value) {
        this.setter('_endTime', value);
    }
    /**
     * @returns { Number }
    */
    get enqueueCount() {
        return this.getter('_enqueueCount');
    }
    /**
     * @param { Number } value
    */
    set enqueueCount(value) {
        this.setter('_enqueueCount', value);
    }
    /**
     * @returns { Array }
    */
    get flags() {
        return this.getter('_flags');
    }
    /**
     * @param { Array } value
    */
    set flags(value) {
        this.setter('_flags', value);
    }
    /**
     * @returns { Array }
    */
    get dependencies() {
        return this.getter('_dependencies');
    }
    /**
     * @param { Array } value
    */
    set dependencies(value) {
        this.setter('_dependencies', value);
    }
    /**
     * @returns { Promise }
    */
    get promise() {
        return this.getter('_promise');
    }
    /**
     * @param { Promise } value
    */
    set promise(value) {
        this.setter('_promise', value);
    }
    /**
     * @returns { Array<Promise> }
    */
    get promises() {
        return this.getter('_promises');
    }
    /**
     * @param { Array<Promise> } value
    */
    set promises(value) {
        this.setter('_promises', value);
    }
    /**
     * @returns { Boolean }
    */
    get isResolved() {
        return this.getter('_isResolved');
    }
    /**
     * @param { Boolean } value
    */
    set isResolved(value) {
        this.setter('_isResolved', value);
    }
    /**
     * @returns { Boolean }
    */
    get isRejected() {
        return this.getter('_isRejected');
    }
    /**
     * @param { Boolean } value
    */
    set isRejected(value) {
        this.setter('_isRejected', value);
    }
    /**
     * @returns { Boolean }
    */
    get isHandledPromise() {
        return this.getter('_isHandledPromise');
    }
    /**
     * @param { Boolean } value
    */
    set isHandledPromise(value) {
        this.setter('_isHandledPromise', value);
    }
    /**
     * @returns { Function }
    */
    get resolve() {
        return this.getter('_resolve');
    }
    /**
     * @param { Function } value
    */
    set resolve(value) {
        this.setter('_resolve', value);
    }
    /**
     * @returns { Function }
    */
    get reject() {
        return this.getter('_reject');
    }
    /**
     * @param { Function } value
    */
    set reject(value) {
        this.setter('_reject', value);
    }
    /**
     * @returns { Array }
    */
    get stack() {
        return this.getter('_stack');
    }
    /**
     * @param { Array } value
    */
    set stack(value) {
        this.setter('_stack', value);
    }
    /**
     * @returns { Object }
    */
    get context() {
        return this.getter('_context');
    }
    /**
     * @param { Object } value
    */
    set context(value) {
        this.setter('_context', value);
    }
    /**
     * @returns { Object }
    */
    get taskStateType() {
        return this.getter('_taskStateType');
    }
    /**
     * @param { Object }
    */
    set taskStateType(value) {
        this.setter('_taskStateType', value);
    }
    /**
     * @returns { TaskQueue }
    */
    get taskQueue() {
        return this.getter('_taskQueue');
    }
    /**
     * @param { TaskQueue }
    */
    set taskQueue(value) {
        this.setter('_taskQueue', value);
    }
    /**
     * @returns { TaskState }
    */
    get taskState() {
        return this.getter('_taskState');
    }
    /**
     * @param { TaskState }
    */
    set taskState(value) {
        this.setter('_taskState', value);
    }
    /**
     * @returns { TaskStateStack }
    */
    get taskStateStack() {
        return this.getter('_taskStateStack');
    }
    /**
     * @param { TaskStateStack }
    */
    set taskStateStack(value) {
        this.setter('_taskStateStack', value);
    }
    /**
     * @returns { TaskCallbackState }
    */
    get taskCallbackState() {
        return this.getter('_taskCallbackState');
    }
    /**
     * @param { TaskCallbackState }
    */
    set taskCallbackState(value) {
        this.setter('_taskCallbackState', value);
    }
    /**
     * @returns { TaskCreatedState }
    */
    get taskCreatedState() {
        return this.getter('_taskCreatedState');
    }
    /**
     * @param { TaskCreatedState }
    */
    set taskCreatedState(value) {
        this.setter('_taskCreatedState', value);
    }
    /**
     * @returns { TaskQueuedState }
    */
    get taskQueuedState() {
        return this.getter('_taskQueuedState');
    }
    /**
     * @param { TaskQueuedState }
    */
    set taskQueuedState(value) {
        this.setter('_taskQueuedState', value);
    }
    /**
     * @returns { TaskRequeueState }
    */
    get taskRequeueState() {
        return this.getter('_taskRequeueState');
    }
    /**
     * @param { TaskRequeueState }
    */
    set taskRequeueState(value) {
        this.setter('_taskRequeueState', value);
    }
    /**
     * @returns { TaskWaitForPromiseState }
    */
    get taskWaitForPromiseState() {
        return this.getter('_taskWaitForPromiseState');
    }
    /**
     * @param { TaskWaitForPromiseState }
    */
    set taskWaitForPromiseState(value) {
        this.setter('_taskWaitForPromiseState', value);
    }
    /**
     * @returns { TaskRunner }
    */
    get taskRunner() {
        return this.getter('_taskRunner');
    }
    /**
     * @param { TaskRunner }
    */
    set taskRunner(value) {
        this.setter('_taskRunner', value);
    }
    /**
     * @returns { HighPriorityTaskQueue }
    */
    get highPriorityTaskQueue() {
        return this.getter('_highPriorityTaskQueue');
    }
    /**
     * @param { HighPriorityTaskQueue }
    */
    set highPriorityTaskQueue(value) {
        this.setter('_highPriorityTaskQueue', value);
    }
    /**
     * @returns { MediumPriorityTaskQueue }
    */
    get mediumPriorityTaskQueue() {
        return this.getter('_mediumPriorityTaskQueue');
    }
    /**
     * @param { MediumPriorityTaskQueue }
    */
    set mediumPriorityTaskQueue(value) {
        this.setter('_mediumPriorityTaskQueue', value);
    }
    /**
     * @returns { LowPriorityTaskQueue }
    */
    get lowPriorityTaskQueue() {
        return this.getter('_lowPriorityTaskQueue');
    }
    /**
     * @param { LowPriorityTaskQueue }
    */
    set lowPriorityTaskQueue(value) {
        this.setter('_lowPriorityTaskQueue', value);
    }
    /**
     * @returns { Task }
    */
    get task() {
        return this.getter('_task');
    }
    /**
     * @param { Task }
    */
    set task(value) {
        this.setter('_task', value);
    }
    /**
     * This is global
     * @returns { Array }
    */
    get queue() {
        return this.getter('_queue');
    }
    /**
     * This is global
     * @param { Array } value
    */
    set queue(value) {
        this.setter('_queue', value);
    }
    /**
     * This is global
     * @returns { { Id: string } }
    */
    get queueLock() {
        return this.getter('_queueLock');
    }
    /**
     * This is global
     * @param { { Id: string } } value
    */
    set queueLock(value) {
        this.setter('_queueLock', value);
    }
    /**
    * @returns { Number }
   */
    get timeoutMilli() {
        return this.getter('_timeoutMilli');
    }
    /**
     * @param { Number } value
    */
    set timeoutMilli(value) {
        this.setter('_timeoutMilli', value);
    }
    /**
     * @returns { TaskPromise }
    */
    get taskPromise() {
        return this.getter('_taskPromise');
    }
    /**
     * @param { TaskPromise }
    */
    set taskPromise(value) {
        this.setter('_taskPromise', value);
    }
    /**
     * @returns { { Id: string } }
    */
    get stackLock() {
        return this.getter('_stackLock');
    }
    /**
     * @param { { Id: string } } value
    */
    set stackLock(value) {
        this.setter('_stackLock', value);
    }
    /**
     * @returns { Object }
    */
    get state() {
        return this.getter('_state');
    }
    /**
     * @param { Object }
    */
    set state(value) {
        this.setter('_state', value);
    }
    /**
     * @returns { Boolean }
    */
    get isTimeout() {
        return this.getter('_isTimeout');
    }
    /**
     * @param { Boolean }
    */
    set isTimeout(value) {
        this.setter('_isTimeout', value);
    }
    /**
     * @param { Object } key
     * @param { Function } callback
    */
    onSet(key, callback) {
        let _key = Object.keys(key)[0];
        if (!_key.startsWith('_')) {
            _key = `_${_key}`;
        }
        this._setters.push({ key: _key, callback });
    }
    /**
     * @param { Object } key
     * @param { Function } callback
    */
    onGet(key, callback) {
        let _key = Object.keys(key)[0];
        if (!_key.startsWith('_')) {
            _key = `_${_key}`;
        }
        this._getters.push({ key: _key, callback });
    }
}
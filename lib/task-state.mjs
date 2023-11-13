import {
    Task,
    TaskCompletedState,
    TaskContainer,
    TaskMoveStateError
} from "./registry.mjs";

/**
 * @callback taskStateCallback
 * @param { TaskState } state
*/
export class TaskState extends TaskContainer {
    /**
     * @param { Task } task
    */
    constructor(task) {
        super(task);

        //copy state from previous state
        super.taskStateStack.unshift(this);
        super.taskStateType = this.constructor;
    }
    /**
     * @template { T }
     * @param { T } taskStateType
     * @returns { TaskState }
    */
    getState(taskStateType) {
        const _stack = super.taskStateStack;
        const cloned = _stack.clone();
        let _index = 0;
        while (cloned.peek()) {
            const _state = cloned.shift();
            if (_state instanceof taskStateType) {
                return {
                    _index,
                    _state
                };
            }
            _index = _index + 1;
        }
        return {
            _index: -1,
            _state: null
        };
    }
    /**
     * @template { T }
     * @param { T } taskStateType
     * @returns { Boolean }
    */
    stateIndex(taskStateType) {
        const { _index } = this.getState(taskStateType);
        return _index;
    }
    /**
     * @template { T }
     * @param { T } taskStateType
     * @returns { Boolean }
    */
    hadState(taskStateType) {
        const { _index } = this.getState(taskStateType);
        return _index > -1;
    }
    /**
     * @template { T }
     * @param { T } taskStateType
     * @returns { Boolean }
    */
    isAtState(taskStateType) {
        const { _index } = this.getState(taskStateType);
        return _index === 0;
    }
    moveTopOfStack() {
        super.taskStateStack.unshift(this);
    }
    /**
     * @param { Boolean } peek
    */
    async handleTopOfStack() {
        const taskStateStack = super.taskStateStack.clone();
        if (taskStateStack.peek()) {
            const taskState = taskStateStack.shift();
            return await taskState.handle();
        } else if (this.hadState(TaskCompletedState)) {
            return true;
        } else {
            super.error = new TaskMoveStateError(super.task);
            throw super.error;
        }
    }
    /**
     * @returns { Object }
    */
    get currentState() {
        return super.taskStateType;
    }
    /**
     * @returns { TaskState }
    */
    getNextState() {
        return super.state;
    }
}
import {
    Task,
    TaskContainer
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
        super.taskStateStack.unshift(this);
        super.state = this.constructor;
    }
    /**
     * @template { T }
     * @param { T } taskStateType
     * @returns { TaskState }
    */
    getState(taskStateType) {
        const cloned = super.taskStateStack.clone();
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
    async handleTopOfStack() {
        const cloned = super.taskStateStack.clone();
        if (cloned.peek()) {
            const state = cloned.shift();
            return await state.handle();
        }
        return false;
    }
    /**
     * @returns { Object }
    */
    get currentState() {
        return super.state;
    }
}
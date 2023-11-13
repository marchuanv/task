import {
    TaskContainer,
    TaskState
} from "./registry.mjs";

export class TaskStateStack extends TaskContainer {
    /**
     * @param { Task } task
    */
    constructor(task) {
        super(task);
    }
    /**
     * @returns { TaskState }
    */
    peek() {
        return super.stack[0];
    }
    /**
     * @returns { TaskState }
    */
    shift() {
        return super.stack.shift();
    }
    /**
     * @param { TaskState } taskState
    */
    unshift(taskState) {
        const index = super.stack.findIndex(state => state.Id === taskState.Id);
        if (index === -1) {
            super.stack.unshift(taskState);
        } else {
            super.stack.splice(index, 1);
            super.stack.unshift(taskState);
        }
    }
    /**
     * @returns { TaskStateStack }
    */
    clone() {
        const taskStateStack = new TaskStateStack(super.task);
        const stack = super.stack;
        for (const taskState of stack) {
            taskStateStack.stack.push(taskState);
        }
        return taskStateStack;
    }
}
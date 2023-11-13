import { Task, TaskCallbackState, TaskQueuedState } from '../../lib/registry.mjs';
const suite = describe('when setting states for a task given a task state stack ', () => {
    it('should be in the scope of a task', async () => {

        const task = new Task('StackTaskScope1', { Id: null }, {}, 2000);

        const queuedState = new TaskQueuedState(task);
        const callbackState = new TaskCallbackState(task);

        expect(queuedState.taskStateStack.Id).toBe(callbackState.taskStateStack.Id);

        expect(queuedState.Id).not.toBe(task.Id);
        expect(callbackState.Id).not.toBe(task.Id);

        expect(queuedState.taskStateStack.stack.length).toBe(3); //includes state created by Task constructor
        expect(callbackState.taskStateStack.stack.length).toBe(3); //includes state created by Task constructor

        const task2 = new Task('StackTaskScope2', { Id: null }, {}, 2000);

        const queuedState2 = new TaskQueuedState(task2);
        const callbackState2 = new TaskCallbackState(task2);

        expect(queuedState2.taskStateStack.Id).toBe(callbackState2.taskStateStack.Id);

        expect(queuedState2.Id).not.toBe(task2.Id);
        expect(callbackState2.Id).not.toBe(task2.Id);

        expect(queuedState2.taskStateStack.stack.length).toBe(3); //includes state created by Task constructor
        expect(callbackState2.taskStateStack.stack.length).toBe(3); //includes state created by Task constructor

    });
});
process.specs.set(suite, []);
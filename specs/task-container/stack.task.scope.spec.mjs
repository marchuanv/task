import { Task, TaskCallbackState, TaskQueuedState } from '../../lib/registry.mjs';
const suite = describe('when setting states for a task given a task state stack ', () => {
    it('should be in the scope of a task', async () => {

        const task = new Task('StackTaskScope', { Id: null }, {}, 2000);

        const queuedState = new TaskQueuedState(task);
        const callbackState = new TaskCallbackState(task);

        expect(queuedState.taskStateStack.Id).toBe(callbackState.taskStateStack.Id);

        expect(queuedState.Id).not.toBe(task.Id);
        expect(callbackState.Id).not.toBe(task.Id);

        expect(queuedState.taskStateStack.stack.length).toBe(3); //includes state created by Task constructor
        expect(callbackState.taskStateStack.stack.length).toBe(3); //includes state created by Task constructor
    });
});
process.specs.set(suite, []);
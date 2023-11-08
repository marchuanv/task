
import { TaskPromise } from '../../lib/task-promise.mjs';
import { TaskProperties } from '../../lib/task-properties.mjs';
const suite = fdescribe('when resolving a promise for a repeated task given data and queue timeout', () => {
    it('should result in error', async () => {

        const taskProperties = new TaskProperties('TaskPromiseTestRepeatQueueTimeout', {
            Id: 'TaskPromiseTestRepeatQueueTimeout'
        }, {}, 1000);

        setTimeout(async () => {
            let _taskPromise = new TaskPromise(taskProperties);
            _taskPromise.resolve({ message: 'TaskPromiseTestRepeatQueueTimeout1' });
            console.log('TaskPromiseTestRepeatQueueTimeout1');
        }, 500);

        setTimeout(async () => {
            let _taskPromise = new TaskPromise(taskProperties);
            _taskPromise.resolve({ message: 'TaskPromiseTestRepeatQueueTimeout2' });
            console.log('TaskPromiseTestRepeatQueueTimeout2');
        }, 1000);

        setTimeout(async () => {
            taskProperties.promise.resolve({ message: 'TaskPromiseTestRepeatQueueTimeout' });
            console.log('TaskPromiseTestRepeatQueueTimeout');
        }, 1000);

        try {
            await taskProperties.promise.get();
            fail('TaskPromise should have raised an error');
        } catch (error) {
            expect(error).toBeDefined();
            expect(error).not.toBeNull();
            expect(error.message).toBe('all task promises for a single task must be queued within 1000 milliseconds');
        }
    });
});
process.specs.set(suite, []);
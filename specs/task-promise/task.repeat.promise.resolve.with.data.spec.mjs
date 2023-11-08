
import { TaskPromise } from '../../lib/task-promise.mjs';
import { TaskProperties } from '../../lib/task-properties.mjs';
const suite = fdescribe('when resolving a promise for a repeated task given data', () => {
    it('should resolve with data', async () => {
        const taskProperties = new TaskProperties('TaskPromiseTestRepeat', { Id: 'TaskPromiseTestRepeat' }, {}, 1000);
        setTimeout(async () => {
            let _taskPromise = new TaskPromise(taskProperties);
            _taskPromise.resolve({ message: 'TaskPromiseTestRepeat1' });
        }, 100);
        setTimeout(async () => {
            let _taskPromise = new TaskPromise(taskProperties);
            _taskPromise.resolve({ message: 'TaskPromiseTestRepeat2' });
        }, 100);
        setTimeout(async () => {
            let _taskPromise = new TaskPromise(taskProperties);
            _taskPromise.resolve({ message: 'TaskPromiseTestRepeat3' });
        }, 100);
        setTimeout(async () => {
            let _taskPromise = new TaskPromise(taskProperties);
            _taskPromise.resolve({ message: 'TaskPromiseTestRepeat4' });
        }, 100);
        setTimeout(async () => {
            let _taskPromise = new TaskPromise(taskProperties);
            _taskPromise.resolve({ message: 'TaskPromiseTestRepeat5' });
        }, 100);
        const results = await taskProperties.promise.get();
        expect(results).toBeDefined();
        expect(results).not.toBeNull();
        expect(JSON.stringify(results)).toBe(JSON.stringify({ message: `TaskPromiseTestRepeat5` }));
    });
});
process.specs.set(suite, []);
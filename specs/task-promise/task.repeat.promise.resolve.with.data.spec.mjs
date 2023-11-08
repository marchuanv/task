
import { TaskPromise } from '../../lib/task-promise.mjs';
import { TaskProperties } from '../../lib/task-properties.mjs';
const suite = fdescribe('when resolving a promise for a repeated task given data', () => {
    it('should resolve with data', async () => {
        const taskProperties = new TaskProperties('TaskPromiseTestRepeat', {
            Id: 'TaskPromiseTestRepeat'
        }, {}, 1000);
        setTimeout(async () => {
            let _taskPromise = new TaskPromise(taskProperties);
            _taskPromise.resolve({ message: 'TaskPromiseTestRepeat5' });
            console.log('TaskPromiseTestRepeat5');
        }, 100);
        setTimeout(async () => {
            let _taskPromise = new TaskPromise(taskProperties);
            _taskPromise.resolve({ message: 'TaskPromiseTestRepeat1' });
            console.log('TaskPromiseTestRepeat1');
        }, 150);
        setTimeout(async () => {
            let _taskPromise = new TaskPromise(taskProperties);
            _taskPromise.resolve({ message: 'TaskPromiseTestRepeat2' });
            console.log('TaskPromiseTestRepeat2');
        }, 300);
        setTimeout(async () => {
            let _taskPromise = new TaskPromise(taskProperties);
            _taskPromise.resolve({ message: 'TaskPromiseTestRepeat4' });
            console.log('TaskPromiseTestRepeat4');
        }, 310);
        setTimeout(async () => {
            let _taskPromise = new TaskPromise(taskProperties);
            _taskPromise.resolve({ message: 'TaskPromiseTestRepeat3' });
            console.log('TaskPromiseTestRepeat3');
        }, 300);
        setTimeout(async () => {
            taskProperties.promise.resolve({ message: 'TaskPromiseTestRepeat' });
            console.log('TaskPromiseTestRepeat');
        }, 400);
        const results = await taskProperties.promise.get();
        expect(results).toBeDefined();
        expect(results).not.toBeNull();
        expect(JSON.stringify(results)).toBe(JSON.stringify({ message: `TaskPromiseTestRepeat5` }));
    });
});
process.specs.set(suite, []);
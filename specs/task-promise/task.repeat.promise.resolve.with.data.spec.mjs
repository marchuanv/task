
import { TaskPromise } from '../../lib/task-promise.mjs';
import { TaskProperties } from '../../lib/task-properties.mjs';
const suite = fdescribe('when resolving a promise for a repeated task given data', () => {
    it('should resolve with data', async () => {
        const taskProperties = new TaskProperties('TaskPromiseTestRepeat', { Id: 'TaskPromiseTestRepeat' }, {}, 1000);
        const expectedMessage = { message: 'TaskPromiseTestRepeat' };
        let count = 1;
        setTimeout(() => {
            while (count <= 5) {
                expectedMessage.message = `TaskPromiseTestRepeat${count}`;
                let _taskPromise = new TaskPromise(taskProperties);
                taskProperties.data = expectedMessage;
                _taskPromise.resolve();
                count = count + 1;
            }
        }, 3000);
        const results = await taskProperties.promise.get();
        expect(results).toBeDefined();
        expect(results).not.toBeNull();
        expect(JSON.stringify(results)).toBe(JSON.stringify({ message: `TaskPromiseTestRepeat5` }));
    });
});
process.specs.set(suite, []);
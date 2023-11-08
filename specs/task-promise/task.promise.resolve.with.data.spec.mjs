
import { TaskProperties } from '../../lib/task-properties.mjs';
const suite = fdescribe('when resolving a promise for a task given data', () => {
    it('should resolve with data', async () => {
        const taskProperties = new TaskProperties('TaskPromiseTest', { Id: 'TaskPromiseTest' }, { message: 'TaskPromiseTest' }, 1000);
        setTimeout(() => {
            taskProperties.data = { message: 'TaskPromiseTestResolve' };
            taskProperties.promise.resolve();
        }, 3000);
        const results = await taskProperties.promise.get();
        expect(results).toBeDefined();
        expect(results).not.toBeNull();
        expect(JSON.stringify(results)).toBe(JSON.stringify({ message: 'TaskPromiseTestResolve' }));
    });
});
process.specs.set(suite, []);
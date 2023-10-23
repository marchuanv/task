import { TaskFlag } from '../../../lib/task-flag.mjs';
import { TestTask } from '../../test-task.mjs';
const suite = describe('when a once-off short task resolve with null given handle errors', () => {
    it('should NOT terminate and handle the error', async () => {
        let _error = null;
        try {
            await TestTask.create(suite, 'ShortOnceOffNullDataResolveTaskError', [TaskFlag.OnceOffNoDataResolve]).queue(0, async function () {
                this.complete(null);
            })
        } catch (error) {
            _error = error;
        } finally {
            expect(_error).toBeNull();
        }
    });
});
process.specs.set(suite, []);
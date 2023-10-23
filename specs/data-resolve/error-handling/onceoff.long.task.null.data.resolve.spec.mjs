import { TaskFlag } from '../../../lib/task-flag.mjs';
import { TestTask } from '../../test-task.mjs';
const suite = describe('when a once-off long task resolve with null given handle errors', () => {
    it('should handle the error and terminate gracefully', async () => {
        let _error = null;
        try {
            await TestTask.create(suite, 'LongOnceOffNullDataResolveTaskError', [TaskFlag.OnceOffDataResolve]).queue(0, async function () {
                await this.simulateDelay();
                this.complete(null);
            })
        } catch (error) {
            _error = error;
        } finally {
            expect(_error).toBeDefined();
            expect(_error.message).toContain('task is configured to be once off and resolve with data, but was not resolved with valid data');
        }
    });
});
process.specs.set(suite, []);
import { TaskFlag } from '../../../../lib/task-flag.mjs';
import { TestTask } from '../../../test-task.mjs';
const suite = fdescribe('when a repeat short task resolve with undefined given error handling', () => {
    it('should handle the error and terminate gracefully', async () => {
        let _error = null;
        try {
            await TestTask.create(suite, 'ShortRepeatUndefinedDataResolveTaskError', [TaskFlag.RepeatDataResolve]).queue(0, async function () {
                this.complete(undefined);
            });
        } catch (error) {
            _error = error;
        } finally {
            expect(_error).toBeDefined();
            expect(_error.message).toContain('task is configured to resolve with data, but was not resolved with valid data');
        }
    });
    it('should terminate the repeating task', (done) => {
        let task;
        TestTask.create(suite, 'ShortRepeatUndefinedDataResolveTaskTerminate', [TaskFlag.RepeatDataResolve]).queue(0, async function () {
            task = this;
            await this.simulateDelay();
            this.complete(undefined);
        }).catch(async () => {
            setTimeout(() => {
                expect(task.enqueueCount).toBe(1);
                expect(task.enqueueCount).toBe(1);
                expect(task.enqueueCount).toBe(1);
                done();
            }, 2000);
        });
    });
});
process.specs.set(suite, []);
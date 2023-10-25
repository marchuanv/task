import { TaskFlag } from '../../../../lib/task-flag.mjs';
import { TestTask } from '../../../test-task.mjs';
const suite = describe('when a once-off long task is resolve with undefined given error handling', () => {

    let promise;
    beforeAll(async () => {
        promise = TestTask.create(suite, 'LongTaskOnceOffResolvedWithUndefined', [TaskFlag.OnceOffDataResolve]).queue(0, async function () {
            await this.simulateDelay();
            this.complete(undefined);
        });
    });

    it('should handle the error and terminate the once-off task', (done) => {
        promise.then((task) => {
            setTimeout(async () => {
                expect(task.error).toBeDefined();
                expect(task.error.message).toContain('task is configured to resolve with data, but was not resolved with valid data');
                expect(task.isLongRunning).toBeTrue();
                expect(task.enqueueCount).toBe(1);
                fail('expected the task promise to be rejected and not resolved');
                done();
            }, 2000);
        }).catch((task) => {
            expect(task.error).toBeDefined();
            expect(task.error.message).toContain('task is configured to resolve with data, but was not resolved with valid data');
            expect(task.isLongRunning).toBeTrue();
            expect(task.enqueueCount).toBe(1);
            done();
        });
    });
});
process.specs.set(suite, []);
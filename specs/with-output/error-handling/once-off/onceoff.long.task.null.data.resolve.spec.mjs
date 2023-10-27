import { TaskFlag } from '../../../../lib/task-flag.mjs';
import { Task } from '../../../../task.mjs';
import { TestTask } from '../../../test-task.mjs';
const suite = describe('when a once-off long task is resolved with null given an error', () => {

    let promise;
    beforeAll(async () => {
        promise = TestTask.create(suite, 'LongTaskOnceOffResolvedWithNull', [TaskFlag.OnceOffWithOutput]).run(0, async function () {
            await this.simulateDelay();
            this.complete(null);
        });
    });

    it('should handle the error', (done) => {
        promise.then((task) => {
            expect(task).toBeInstanceOf(Task);
            expect(task.error).toBeDefined();
            expect(task.error).not.toBeNull();
            fail('expected the task promise to be rejected and not resolved');
            done();
        }).catch((task) => {
            expect(task).toBeInstanceOf(Task);
            expect(task.error).toBeDefined();
            expect(task.error).not.toBeNull();
            expect(task.error.message).toContain('task is configured to resolve with data, but was not resolved with valid data');
            expect(task.isLongRunning).toBeTrue();
            expect(task.enqueueCount).toBe(1);
            done();
        });
    });
});
process.specs.set(suite, []);
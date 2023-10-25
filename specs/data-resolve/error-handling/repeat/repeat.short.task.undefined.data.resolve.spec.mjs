import { TaskFlag } from '../../../../lib/task-flag.mjs';
import { Task } from '../../../../task.mjs';
import { TestTask } from '../../../test-task.mjs';
const suite = describe('when a repeated short task is resolved with undefined given an error', () => {

    let promise;
    beforeAll(async () => {
        promise = TestTask.create(suite, 'ShortTaskRepeatedDataResolvedWithUndefined', [TaskFlag.RepeatDataResolve]).run(0, async function () {
            this.complete(undefined);
        });
    });

    it('should handle the error and terminate the repeating task', (done) => {
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
            expect(task.isLongRunning).toBeFalse();
            expect(task.enqueueCount).toBe(1);
            done();
        });
    });

});
process.specs.set(suite, []);
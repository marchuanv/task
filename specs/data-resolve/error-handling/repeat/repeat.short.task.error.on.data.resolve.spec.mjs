import { TaskFlag } from '../../../../lib/task-flag.mjs';
import { Task } from '../../../../task.mjs';
import { TestTask } from '../../../test-task.mjs';
const suite = describe('when a repeated short task results in an error during the promise resolve', () => {

    let promise;
    beforeAll(async () => {
        promise = TestTask.create(suite, 'ShortTaskRepeatedErrorOnPromiseResolve', [TaskFlag.RepeatDataResolve]).run(0, async function () {
            this.complete({ message: 'short task repeat' });
            throw new Error('TaskError');
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
            expect(task.error.message).toContain('TaskError');
            expect(task.isLongRunning).toBeFalse();
            expect(task.enqueueCount).toBe(1);
            done();
        });
    });

});
process.specs.set(suite, []);
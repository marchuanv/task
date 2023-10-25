import { TaskFlag } from '../../../../lib/task-flag.mjs';
import { TestTask } from '../../../test-task.mjs';
const suite = describe('when a repeated short task results in error after the promise has been resolved given error handling', () => {

    let promise;
    beforeAll(async () => {
        promise = TestTask.create(suite, 'ShortTaskRepeatedErrorAfterPromiseResolve', [TaskFlag.RepeatDataResolve]).queue(0, async function () {
            this.complete({ message: 'short task repeat' });
            if (this.enqueueCount > 1) {
                throw new Error('TaskError');
            }
        });
    });

    it('should handle the error and terminate the task repeat', (done) => {
        promise.then((task) => {
            setTimeout(async () => {
                expect(task.error).toBeDefined();
                expect(task.error.message).toContain('TaskError');
                expect(task.isLongRunning).toBeFalse();
                expect(task.enqueueCount).toBe(2);
                done();
            }, 2000);
        }).catch((task) => {
            expect(task.error).toBeDefined();
            expect(task.error.message).toContain('TaskError');
            expect(task.isLongRunning).toBeFalse();
            expect(task.enqueueCount).toBe(2);
            fail('expected the task promise to be resolved and not rejected');
            done();
        });
    });

});
process.specs.set(suite, []);
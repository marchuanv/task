import { TaskFlag } from '../../lib/task-flag.mjs';
import { Task } from '../../task.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when a repeated short task results in an error after the promise has been resolved', () => {

    let promise;
    beforeAll(async () => {
        promise = TestTask.create(suite, 'ShortTaskRepeatedErrorAfterPromiseResolve', [TaskFlag.RepeatWithOutput]).run(0, async function () {
            this.complete({ message: 'short task repeat' });
            if (this.enqueueCount > 1) {
                throw new Error('TaskError');
            }
        });
    });

    it('should handle the error and terminate the repeating task', (done) => {
        promise.then((task) => {
            expect(task).toBeInstanceOf(Task);
            setTimeout(async () => {
                expect(task.error).toBeDefined();
                expect(task.error).not.toBeNull();
                expect(task.error.message).toContain('TaskError');
                expect(task.isLongRunning).toBeFalse();
                expect(task.enqueueCount).toBe(2);
                done();
            }, 2000);
        }).catch((task) => {
            expect(task).toBeInstanceOf(Task);
            expect(task.error).toBeDefined();
            expect(task.error).not.toBeNull();
            fail('expected the task promise to be resolved and not rejected');
            done();
        });
    });

});
process.specs.set(suite, []);
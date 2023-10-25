import { TaskFlag } from '../../lib/task-flag.mjs';
import { Task } from '../../task.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when a once-off long task is enqueued given an error', () => {

    let promise;
    beforeAll(async () => {
        promise = TestTask.create(suite, 'LongTaskOnceOffEnqueueError', [TaskFlag.OnceOffDataResolve]).run();
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
            expect(task.error.message).toContain('was not queued, no callback function');
            expect(task.isLongRunning).toBeFalse(); //the task should never run
            expect(task.enqueueCount).toBe(0);
            done();
        });
    });
});
process.specs.set(suite, []);
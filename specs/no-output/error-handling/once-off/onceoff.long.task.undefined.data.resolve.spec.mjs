import { TaskFlag } from '../../../../lib/task-flag.mjs';
import { Task } from '../../../../task.mjs';
import { TestTask } from '../../../test-task.mjs';
const suite = describe('when a once-off long task is resolved with undefined given NO errors', () => {

    let promise;
    beforeAll(async () => {
        promise = TestTask.create(suite, 'LongTaskOnceOffResolvedWithUndefined', [TaskFlag.OnceOffNoOutput]).run(0, async function () {
            await this.simulateDelay();
            this.complete(undefined);
        });
    });

    it('should not result in error or terminate the task', (done) => {
        promise.then((task) => {
            expect(task).toBeInstanceOf(Task);
            setTimeout(async () => {
                expect(task.error).toBeDefined();
                expect(task.error).toBeNull();
                expect(task.isLongRunning).toBeTrue();
                expect(task.enqueueCount).toBe(1);
                expect(task.data).toBeNull();
                done();
            }, 2000);
        }).catch((task) => {
            expect(task).toBeInstanceOf(Task);
            expect(task.error).toBeDefined();
            expect(task.error).toBeNull();
            fail('expected the task promise to be resolved and not rejected');
            done();
        });
    });
});
process.specs.set(suite, []);
import { TaskFlag } from '../../../../lib/task-flag.mjs';
import { Task } from '../../../../task.mjs';
import { TestTask } from '../../../test-task.mjs';
const suite = describe('when a repeated long task is resolved with null given NO errors', () => {

    let promise;
    beforeAll(async () => {
        promise = TestTask.create(suite, 'LongTaskRepeatedResolvedWithNull', [TaskFlag.RepeatNoOutput]).run(0, async function () {
            await this.simulateDelay();
            this.complete(null);
        });
    });

    it('should not terminate the repeating task', (done) => {
        promise.then((task) => {
            setTimeout(() => {
                expect(task).toBeInstanceOf(Task);
                expect(task.error).toBeDefined();
                expect(task.error).toBeNull();
                expect(task.isLongRunning).toBeTrue();
                expect(task.enqueueCount).toBeGreaterThan(1);
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
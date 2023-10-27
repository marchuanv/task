import { TaskFlag } from '../../../../lib/task-flag.mjs';
import { Task } from '../../../../task.mjs';
import { TestTask } from '../../../test-task.mjs';
const suite = describe('when a repeated short task is resolved with undefined given NO errors', () => {

    let promise;
    beforeAll(async () => {
        promise = TestTask.create(suite, 'ShortTaskRepeatedResolvedWithUndefined', [TaskFlag.RepeatNoOutput]).run(0, async function () {
            this.complete(undefined);
        });
    });

    it('should not terminate the repeating task', (done) => {
        promise.then((task) => {
            setTimeout(() => {
                expect(task).toBeInstanceOf(Task);
                expect(task.error).toBeDefined();
                expect(task.error).toBeNull();
                expect(task.isLongRunning).toBeFalse();
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
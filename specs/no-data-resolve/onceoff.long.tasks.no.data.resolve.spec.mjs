import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing a long running tasks given a once off no data resolve', () => {
    it('should run once', async () => {
        const promises = [
            TestTask.create(suite, 'OnceOffNoDataResolveLongTaskA', [TaskFlag.OnceOffNoDataResolve]).run(0, async function () {
                await this.simulateDelay();
            }),
            TestTask.create(suite, 'OnceOffNoDataResolveLongTaskB', [TaskFlag.OnceOffNoDataResolve]).run(0, async function () {
                await this.simulateDelay();
            }),
            TestTask.create(suite, 'OnceOffNoDataResolveLongTaskC', [TaskFlag.OnceOffNoDataResolve]).run(0, async function () {
                await this.simulateDelay();
            })
        ];
        const results = await Promise.all(promises);
        const [taskA, taskB, taskC] = results;

        expect(taskA.isLongRunning).toBeTrue();
        expect(taskB.isLongRunning).toBeTrue();
        expect(taskC.isLongRunning).toBeTrue();

        expect(taskA.data).toBeNull();
        expect(taskB.data).toBeNull();
        expect(taskC.data).toBeNull();

        expect(taskA.enqueueCount).toBe(1);
        expect(taskB.enqueueCount).toBe(1);
        expect(taskC.enqueueCount).toBe(1);
    });
});
process.specs.set(suite, []);
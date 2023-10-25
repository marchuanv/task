import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing a long running tasks given a repeat no data resolve', () => {
    it('should run indefinitely', async () => {
        const promises = [
            TestTask.create(suite, 'RepeatNoDataResolveLongTaskA', [TaskFlag.RepeatNoDataResolve]).run(0, async function () {
                await this.simulateDelay();
            }),
            TestTask.create(suite, 'RepeatNoDataResolveLongTaskB', [TaskFlag.RepeatNoDataResolve]).run(0, async function () {
                await this.simulateDelay();
            }),
            TestTask.create(suite, 'RepeatNoDataResolveLongTaskC', [TaskFlag.RepeatNoDataResolve]).run(0, async function () {
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

        expect(taskA.enqueueCount).toBeGreaterThan(1);
        expect(taskB.enqueueCount).toBeGreaterThan(1);
        expect(taskC.enqueueCount).toBeGreaterThan(1);
    });
});
process.specs.set(suite, []);
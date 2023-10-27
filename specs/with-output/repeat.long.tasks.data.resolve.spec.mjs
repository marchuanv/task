import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing a long running tasks given a repeat data resolve', () => {
    it('should run indefinitely', async () => {
        const promises = [
            TestTask.create(suite, 'RepeatDataResolveLongTaskA', [TaskFlag.RepeatWithOutput]).run(0, async function () {
                await this.simulateDelay();
                this.complete('RepeatDataResolveLongTaskASuccess');
            }),
            TestTask.create(suite, 'RepeatDataResolveLongTaskB', [TaskFlag.RepeatWithOutput]).run(0, async function () {
                await this.simulateDelay();
                this.complete('RepeatDataResolveLongTaskBSuccess');
            }),
            TestTask.create(suite, 'RepeatDataResolveLongTaskC', [TaskFlag.RepeatWithOutput]).run(0, async function () {
                await this.simulateDelay();
                this.complete('RepeatDataResolveLongTaskCSuccess');
            })
        ];
        const results = await Promise.all(promises);

        const [taskA, taskB, taskC] = results;

        expect(taskA.isLongRunning).toBeTrue();
        expect(taskB.isLongRunning).toBeTrue();
        expect(taskC.isLongRunning).toBeTrue();

        expect(taskA.data).toBe('RepeatDataResolveLongTaskASuccess');
        expect(taskB.data).toBe('RepeatDataResolveLongTaskBSuccess');
        expect(taskC.data).toBe('RepeatDataResolveLongTaskCSuccess');

        expect(taskA.enqueueCount).toBeGreaterThan(1);
        expect(taskB.enqueueCount).toBeGreaterThan(1);
        expect(taskC.enqueueCount).toBeGreaterThan(1);
    });
});
process.specs.set(suite, []);
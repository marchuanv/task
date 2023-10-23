import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing a long running tasks given a repeat data resolve', () => {
    it('should run indefinitely', async () => {
        const promises = [
            TestTask.create(suite, 'RepeatDataResolveLongTaskA', [TaskFlag.RepeatDataResolve]).queue(0, async function () {
                await this.simulateDelay();
                this.complete('RepeatDataResolveLongTaskASuccess');
            }),
            TestTask.create(suite, 'RepeatDataResolveLongTaskB', [TaskFlag.RepeatDataResolve]).queue(0, async function () {
                await this.simulateDelay();
                this.complete('RepeatDataResolveLongTaskBSuccess');
            }),
            TestTask.create(suite, 'RepeatDataResolveLongTaskC', [TaskFlag.RepeatDataResolve]).queue(0, async function () {
                await this.simulateDelay();
                this.complete('RepeatDataResolveLongTaskCSuccess');
            })
        ];
        const results = await Promise.all(promises);

        const [resultsA, resultsB, resultsC] = results;

        expect(resultsA.isLongRunning).toBeTrue();
        expect(resultsB.isLongRunning).toBeTrue();
        expect(resultsC.isLongRunning).toBeTrue();

        expect(resultsA.results).toBe('RepeatDataResolveLongTaskASuccess');
        expect(resultsB.results).toBe('RepeatDataResolveLongTaskBSuccess');
        expect(resultsC.results).toBe('RepeatDataResolveLongTaskCSuccess');

        expect(resultsA.enqueueCount).toBeGreaterThan(1);
        expect(resultsB.enqueueCount).toBeGreaterThan(1);
        expect(resultsC.enqueueCount).toBeGreaterThan(1);
    });
});
process.specs.set(suite, []);
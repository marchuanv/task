import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing long running tasks given a repeat no data resolve', () => {
    it('should run indefinitely', async () => {
        const promises = [
            TestTask.create(suite, 'RepeatNoDataResolveLongTaskA', [TaskFlag.RepeatNoDataResolve]).queue(0, async function () {
                await this.simulateDelay();
            }),
            TestTask.create(suite, 'RepeatNoDataResolveLongTaskB', [TaskFlag.RepeatNoDataResolve]).queue(0, async function () {
                await this.simulateDelay();
            }),
            TestTask.create(suite, 'RepeatNoDataResolveLongTaskC', [TaskFlag.RepeatNoDataResolve]).queue(0, async function () {
                await this.simulateDelay();
            })
        ];

        const results = await Promise.all(promises);
        const [resultsA, resultsB, resultsC] = results;

        expect(resultsA.isLongRunning).toBeTrue();
        expect(resultsB.isLongRunning).toBeTrue();
        expect(resultsC.isLongRunning).toBeTrue();

        expect(resultsA.results).toBeNull();
        expect(resultsB.results).toBeNull();
        expect(resultsC.results).toBeNull();

        expect(resultsA.enqueueCount).toBeGreaterThan(1);
        expect(resultsB.enqueueCount).toBeGreaterThan(1);
        expect(resultsC.enqueueCount).toBeGreaterThan(1);
    });
});
process.specs.set(suite, []);
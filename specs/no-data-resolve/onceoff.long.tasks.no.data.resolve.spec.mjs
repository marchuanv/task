import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing long running tasks given a once off no data resolve', () => {
    it('should run once', async () => {
        const promises = [
            TestTask.create(suite, 'OnceOffNoDataResolveLongTaskA', [TaskFlag.OnceOffNoDataResolve]).queue(0, async function () {
                await this.simulateDelay();
            }),
            TestTask.create(suite, 'OnceOffNoDataResolveLongTaskB', [TaskFlag.OnceOffNoDataResolve]).queue(0, async function () {
                await this.simulateDelay();
            }),
            TestTask.create(suite, 'OnceOffNoDataResolveLongTaskC', [TaskFlag.OnceOffNoDataResolve]).queue(0, async function () {
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

        expect(resultsA.enqueueCount).toBe(1);
        expect(resultsB.enqueueCount).toBe(1);
        expect(resultsC.enqueueCount).toBe(1);
    });
});
process.specs.set(suite, []);
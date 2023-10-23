import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing a long running tasks given a once off data resolve', () => {
    it('should run once', async () => {
        const promises = [
            TestTask.create(suite, 'OnceOffDataResolveLongTaskA', [TaskFlag.OnceOffDataResolve]).queue(0, async function () {
                await this.simulateDelay();
                this.complete('OnceOffDataResolveLongTaskASuccess');
            }),
            TestTask.create(suite, 'OnceOffDataResolveLongTaskB', [TaskFlag.OnceOffDataResolve]).queue(0, async function () {
                await this.simulateDelay();
                this.complete('OnceOffDataResolveLongTaskBSuccess');
            }),
            TestTask.create(suite, 'OnceOffDataResolveLongTaskC', [TaskFlag.OnceOffDataResolve]).queue(0, async function () {
                await this.simulateDelay();
                this.complete('OnceOffDataResolveLongTaskCSuccess');
            })
        ];
        const results = await Promise.all(promises);

        const [resultsA, resultsB, resultsC] = results;

        expect(resultsA.isLongRunning).toBeTrue();
        expect(resultsB.isLongRunning).toBeTrue();
        expect(resultsC.isLongRunning).toBeTrue();

        expect(resultsA.results).toBe('OnceOffDataResolveLongTaskASuccess');
        expect(resultsB.results).toBe('OnceOffDataResolveLongTaskBSuccess');
        expect(resultsC.results).toBe('OnceOffDataResolveLongTaskCSuccess');

        expect(resultsA.enqueueCount).toBe(1);
        expect(resultsB.enqueueCount).toBe(1);
        expect(resultsC.enqueueCount).toBe(1);
    });
});
process.specs.set(suite, []);
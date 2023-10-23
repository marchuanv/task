import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing short running tasks given a repeat data resolve', () => {
    it('should run indefinitely', async () => {
        const promises = [
            TestTask.create(suite, 'RepeatDataResolveShortTaskA', [TaskFlag.RepeatDataResolve]).queue(0, async function () {
                this.complete('RepeatDataResolveShortTaskASuccess');
            }),
            TestTask.create(suite, 'RepeatDataResolveShortTaskB', [TaskFlag.RepeatDataResolve]).queue(0, async function () {
                this.complete('RepeatDataResolveShortTaskBSuccess');
            }),
            TestTask.create(suite, 'RepeatDataResolveShortTaskC', [TaskFlag.RepeatDataResolve]).queue(0, async function () {
                this.complete('RepeatDataResolveShortTaskCSuccess');
            })
        ];
        const results = await Promise.all(promises);
        const [resultsA, resultsB, resultsC] = results;

        expect(resultsA.isLongRunning).toBeFalse();
        expect(resultsB.isLongRunning).toBeFalse();
        expect(resultsC.isLongRunning).toBeFalse();

        expect(resultsA.results).toBe('RepeatDataResolveShortTaskASuccess');
        expect(resultsB.results).toBe('RepeatDataResolveShortTaskBSuccess');
        expect(resultsC.results).toBe('RepeatDataResolveShortTaskCSuccess');

        expect(resultsA.enqueueCount).toBeGreaterThan(1);
        expect(resultsB.enqueueCount).toBeGreaterThan(1);
        expect(resultsC.enqueueCount).toBeGreaterThan(1);
    });
});
process.specs.set(suite, []);
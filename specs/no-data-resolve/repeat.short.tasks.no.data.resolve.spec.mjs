import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing a short running tasks given a repeat no data resolve', () => {
    it('should run indefinitely', async () => {
        const promises = [
            TestTask.create(suite, 'RepeatNoDataResolveShortTaskA', [TaskFlag.RepeatNoDataResolve]).queue(0, async function () { }),
            TestTask.create(suite, 'RepeatNoDataResolveShortTaskB', [TaskFlag.RepeatNoDataResolve]).queue(0, async function () { }),
            TestTask.create(suite, 'RepeatNoDataResolveShortTaskC', [TaskFlag.RepeatNoDataResolve]).queue(0, async function () { })
        ];

        const results = await Promise.all(promises);
        const [resultsA, resultsB, resultsC] = results;

        expect(resultsA.isLongRunning).toBeFalse();
        expect(resultsB.isLongRunning).toBeFalse();
        expect(resultsC.isLongRunning).toBeFalse();

        expect(resultsA.results).toBeNull();
        expect(resultsB.results).toBeNull();
        expect(resultsC.results).toBeNull();

        expect(resultsA.enqueueCount).toBeGreaterThan(1);
        expect(resultsB.enqueueCount).toBeGreaterThan(1);
        expect(resultsC.enqueueCount).toBeGreaterThan(1);
    });
});
process.specs.set(suite, []);
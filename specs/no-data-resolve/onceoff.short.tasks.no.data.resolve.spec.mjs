import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing a short running tasks given a once off no data resolve', () => {
    it('should run once', async () => {
        const promises = [
            TestTask.create(suite, 'OnceOffNoDataResolveShortTaskA', [TaskFlag.OnceOffNoDataResolve]).queue(0, async function () { }),
            TestTask.create(suite, 'OnceOffNoDataResolveShortTaskB', [TaskFlag.OnceOffNoDataResolve]).queue(0, async function () { }),
            TestTask.create(suite, 'OnceOffNoDataResolveShortTaskC', [TaskFlag.OnceOffNoDataResolve]).queue(0, async function () { })
        ];
        const results = await Promise.all(promises);
        const [resultsA, resultsB, resultsC] = results;

        expect(resultsA.isLongRunning).toBeFalse();
        expect(resultsB.isLongRunning).toBeFalse();
        expect(resultsC.isLongRunning).toBeFalse();

        expect(resultsA.results).toBeNull();
        expect(resultsB.results).toBeNull();
        expect(resultsC.results).toBeNull();

        expect(resultsA.enqueueCount).toBe(1);
        expect(resultsB.enqueueCount).toBe(1);
        expect(resultsC.enqueueCount).toBe(1);
    });
});
process.specs.set(suite, []);
import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = fdescribe('when queueing short running tasks given a once off no data resolve', () => {
    it('should run once', async () => {
        const promises = [
            TestTask.create(suite, 'OnceOffNoDataResolveShortTaskA', [TaskFlag.OnceOffNoDataResolve]).queue(1, async function () { }),
            TestTask.create(suite, 'OnceOffNoDataResolveShortTaskB', [TaskFlag.OnceOffNoDataResolve]).queue(1, async function () { }),
            TestTask.create(suite, 'OnceOffNoDataResolveShortTaskC', [TaskFlag.OnceOffNoDataResolve]).queue(1, async function () { })
        ];
        const results = await Promise.all(promises);
        const [resultsA, resultsB, resultsC] = results;
        expect(resultsA.isLongRunning).toBeFalse();
        expect(resultsB.isLongRunning).toBeFalse();
        expect(resultsC.isLongRunning).toBeFalse();
        expect(resultsA.results).toBeNull();
        expect(resultsB.results).toBeNull();
        expect(resultsC.results).toBeNull();
        const executedTasks = process.specs.get(suite);
        expect(executedTasks.length).toEqual(3);
    });
});
process.specs.set(suite, []);
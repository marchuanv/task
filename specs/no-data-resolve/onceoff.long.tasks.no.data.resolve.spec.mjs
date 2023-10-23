import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = fdescribe('when queueing long running tasks given a once off no data resolve', () => {
    it('should run once', async () => {
        const block = new Promise((resolve) => setTimeout(resolve, 3000));
        const promises = [
            TestTask.create(suite, 'OnceOffNoDataResolveLongTaskA', [TaskFlag.OnceOffNoDataResolve]).queue(1, async function () {
                await block;
            }),
            TestTask.create(suite, 'OnceOffNoDataResolveLongTaskB', [TaskFlag.OnceOffNoDataResolve]).queue(1, async function () {
                await block;
            }),
            TestTask.create(suite, 'OnceOffNoDataResolveLongTaskC', [TaskFlag.OnceOffNoDataResolve]).queue(1, async function () {
                await block;
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
        const executedTasks = process.specs.get(suite);
        expect(executedTasks.length).toEqual(3);
    });
});
process.specs.set(suite, []);
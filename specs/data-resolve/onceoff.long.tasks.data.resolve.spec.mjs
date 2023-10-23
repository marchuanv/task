import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = fdescribe('when queueing long running tasks given a once off data resolve', () => {
    it('should run once', async () => {
        const block = new Promise((resolve) => setTimeout(resolve, 3000));
        const promises = [
            TestTask.create(suite, 'OnceOffDataResolveLongTaskA', [TaskFlag.OnceOffDataResolve]).queue(1, async function () {
                await block;
                this.complete('OnceOffDataResolveLongTaskASuccess');
            }),
            TestTask.create(suite, 'OnceOffDataResolveLongTaskB', [TaskFlag.OnceOffDataResolve]).queue(1, async function () {
                await block;
                this.complete('OnceOffDataResolveLongTaskBSuccess');
            }),
            TestTask.create(suite, 'OnceOffDataResolveLongTaskC', [TaskFlag.OnceOffDataResolve]).queue(1, async function () {
                await block;
                this.complete('OnceOffDataResolveLongTaskCSuccess');
            })
        ];
        const results = await Promise.all(promises);
        const [promiseA, promiseB, promiseC] = results;
        expect(promiseA.isLongRunning).toBeTrue();
        expect(promiseB.isLongRunning).toBeTrue();
        expect(promiseC.isLongRunning).toBeTrue();
        expect(promiseA.results).toBe('OnceOffDataResolveLongTaskASuccess');
        expect(promiseB.results).toBe('OnceOffDataResolveLongTaskBSuccess');
        expect(promiseC.results).toBe('OnceOffDataResolveLongTaskCSuccess');
        const executedTasks = process.specs.get(suite);
        expect(executedTasks.length).toEqual(3);
    });
});
process.specs.set(suite, []);
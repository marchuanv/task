import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = fdescribe('when queueing short running tasks given a once off data resolve', () => {
    it('should run once', async () => {
        const promises = [
            TestTask.create(suite, 'OnceOffDataResolveShortTaskA', [TaskFlag.OnceOffDataResolve]).queue(1, async function () {
                this.complete('OnceOffDataResolveShortTaskASuccess');
            }),
            TestTask.create(suite, 'OnceOffDataResolveShortTaskB', [TaskFlag.OnceOffDataResolve]).queue(1, async function () {
                this.complete('OnceOffDataResolveShortTaskBSuccess');
            }),
            TestTask.create(suite, 'OnceOffDataResolveShortTaskC', [TaskFlag.OnceOffDataResolve]).queue(1, async function () {
                this.complete('OnceOffDataResolveShortTaskCSuccess');
            })
        ];
        const results = await Promise.all(promises);
        const [promiseA, promiseB, promiseC] = results;
        expect(promiseA.isLongRunning).toBeFalse();
        expect(promiseB.isLongRunning).toBeFalse();
        expect(promiseC.isLongRunning).toBeFalse();
        expect(promiseA.results).toBe('OnceOffDataResolveShortTaskASuccess');
        expect(promiseB.results).toBe('OnceOffDataResolveShortTaskBSuccess');
        expect(promiseC.results).toBe('OnceOffDataResolveShortTaskCSuccess');
        const executedTasks = process.specs.get(suite);
        expect(executedTasks.length).toEqual(3);
    });
});
process.specs.set(suite, []);
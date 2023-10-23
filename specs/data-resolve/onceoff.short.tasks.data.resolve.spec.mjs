import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing a short running tasks given a once off data resolve', () => {
    it('should run once', async () => {
        const promises = [
            TestTask.create(suite, 'OnceOffDataResolveShortTaskA', [TaskFlag.OnceOffDataResolve]).queue(0, async function () {
                this.complete('OnceOffDataResolveShortTaskASuccess');
            }),
            TestTask.create(suite, 'OnceOffDataResolveShortTaskB', [TaskFlag.OnceOffDataResolve]).queue(0, async function () {
                this.complete('OnceOffDataResolveShortTaskBSuccess');
            }),
            TestTask.create(suite, 'OnceOffDataResolveShortTaskC', [TaskFlag.OnceOffDataResolve]).queue(0, async function () {
                this.complete('OnceOffDataResolveShortTaskCSuccess');
            })
        ];
        const results = await Promise.all(promises);
        const [resultsA, resultsB, resultsC] = results;

        expect(resultsA.isLongRunning).toBeFalse();
        expect(resultsB.isLongRunning).toBeFalse();
        expect(resultsC.isLongRunning).toBeFalse();

        expect(resultsA.results).toBe('OnceOffDataResolveShortTaskASuccess');
        expect(resultsB.results).toBe('OnceOffDataResolveShortTaskBSuccess');
        expect(resultsC.results).toBe('OnceOffDataResolveShortTaskCSuccess');

        expect(resultsA.enqueueCount).toBe(1);
        expect(resultsB.enqueueCount).toBe(1);
        expect(resultsC.enqueueCount).toBe(1);
    });
});
process.specs.set(suite, []);
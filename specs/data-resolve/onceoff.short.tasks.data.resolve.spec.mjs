import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing a short running tasks given a once off data resolve', () => {
    it('should run once', async () => {
        const promises = [
            TestTask.create(suite, 'OnceOffDataResolveShortTaskA', [TaskFlag.OnceOffDataResolve]).run(0, async function () {
                this.complete('OnceOffDataResolveShortTaskASuccess');
            }),
            TestTask.create(suite, 'OnceOffDataResolveShortTaskB', [TaskFlag.OnceOffDataResolve]).run(0, async function () {
                this.complete('OnceOffDataResolveShortTaskBSuccess');
            }),
            TestTask.create(suite, 'OnceOffDataResolveShortTaskC', [TaskFlag.OnceOffDataResolve]).run(0, async function () {
                this.complete('OnceOffDataResolveShortTaskCSuccess');
            })
        ];
        const results = await Promise.all(promises);
        const [taskA, taskB, taskC] = results;

        expect(taskA.isLongRunning).toBeFalse();
        expect(taskB.isLongRunning).toBeFalse();
        expect(taskC.isLongRunning).toBeFalse();

        expect(taskA.data).toBe('OnceOffDataResolveShortTaskASuccess');
        expect(taskB.data).toBe('OnceOffDataResolveShortTaskBSuccess');
        expect(taskC.data).toBe('OnceOffDataResolveShortTaskCSuccess');

        expect(taskA.enqueueCount).toBe(1);
        expect(taskB.enqueueCount).toBe(1);
        expect(taskC.enqueueCount).toBe(1);
    });
});
process.specs.set(suite, []);
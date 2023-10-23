import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing short running tasks given a once off data resolve', () => {
    it('should run once', (done) => {
        let isLongRunningTaskA = null;
        let isLongRunningTaskB = null;
        let isLongRunningTaskC = null;
        const taskAPromise = TestTask.create(suite, 'OnceOffDataResolveShortTaskA', [TaskFlag.OnceOffDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning(3000);
            this.complete('OnceOffDataResolveShortTaskASuccess');
        });
        const taskBPromise = TestTask.create(suite, 'OnceOffDataResolveShortTaskB', [TaskFlag.OnceOffDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning(3000);
            this.complete('OnceOffDataResolveShortTaskBSuccess');
        });
        const taskCPromise = TestTask.create(suite, 'OnceOffDataResolveShortTaskC', [TaskFlag.OnceOffDataResolve]).queue(async function () {
            isLongRunningTaskC = this.isLongRunning(3000);
            this.complete('OnceOffDataResolveShortTaskCSuccess');
        });
        setTimeout(async () => {
            const executedTasks = process.specs.get(suite);
            const _isLongRunningTaskA = await isLongRunningTaskA;
            const _isLongRunningTaskB = await isLongRunningTaskB;
            const _isLongRunningTaskC = await isLongRunningTaskC;
            expect(_isLongRunningTaskA).toBeFalse();
            expect(_isLongRunningTaskB).toBeFalse();
            expect(_isLongRunningTaskC).toBeFalse();
            const taskAPromiseResults = await taskAPromise;
            const taskBPromiseResults = await taskBPromise;
            const taskCPromiseResults = await taskCPromise;
            expect(taskAPromiseResults).toBe('OnceOffDataResolveShortTaskASuccess');
            expect(taskBPromiseResults).toBe('OnceOffDataResolveShortTaskBSuccess');
            expect(taskCPromiseResults).toBe('OnceOffDataResolveShortTaskCSuccess');
            expect(executedTasks.length).toEqual(3);
            done();
        }, 10000);
    });
});
process.specs.set(suite, []);
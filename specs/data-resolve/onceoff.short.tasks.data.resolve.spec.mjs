import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
describe('when queueing short running tasks given a once off data resolve', () => {
    it('should run once', (done) => {
        let executedTasks = [];
        let isLongRunningTaskA = null;
        let isLongRunningTaskB = null;
        let isLongRunningTaskC = null;
        const block = new Promise((resolve) => setTimeout(resolve, 2000));
        const taskAPromise = TestTask.create('OnceOffDataResolveShortTaskA', [TaskFlag.OnceOffDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning();
            executedTasks.push(this);
            await block;
            this.complete('OnceOffDataResolveShortTaskASuccess');
        });
        const taskBPromise = TestTask.create('OnceOffDataResolveShortTaskB', [TaskFlag.OnceOffDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning();
            executedTasks.push(this);
            await block;
            this.complete('OnceOffDataResolveShortTaskBSuccess');
        });
        const taskCPromise = TestTask.create('OnceOffDataResolveShortTaskC', [TaskFlag.OnceOffDataResolve]).queue(async function () {
            isLongRunningTaskC = this.isLongRunning();
            executedTasks.push(this);
            await block;
            this.complete('OnceOffDataResolveShortTaskCSuccess');
        });
        setTimeout(async () => {
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

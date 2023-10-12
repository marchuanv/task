import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
describe('when queueing long running tasks given a once off data resolve', () => {
    it('should run once', (done) => {
        let executedTasks = [];
        let isLongRunningTaskA = null;
        let isLongRunningTaskB = null;
        let isLongRunningTaskC = null;
        const block = new Promise((resolve) => setTimeout(resolve, 2000));
        const taskAPromise = TestTask.create('OnceOffDataResolveLongTaskA', [TaskFlag.OnceOffDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning();
            executedTasks.push(this);
            await block;
            this.complete('OnceOffDataResolveLongTaskASuccess');
        });
        const taskBPromise = TestTask.create('OnceOffDataResolveLongTaskB', [TaskFlag.OnceOffDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning();
            executedTasks.push(this);
            await block;
            this.complete('OnceOffDataResolveLongTaskBSuccess');
        });
        const taskCPromise = TestTask.create('OnceOffDataResolveLongTaskC', [TaskFlag.OnceOffDataResolve]).queue(async function () {
            isLongRunningTaskC = this.isLongRunning();
            executedTasks.push(this);
            await block;
            this.complete('OnceOffDataResolveLongTaskCSuccess');
        });
        setTimeout(async () => {
            const _isLongRunningTaskA = await isLongRunningTaskA;
            const _isLongRunningTaskB = await isLongRunningTaskB;
            const _isLongRunningTaskC = await isLongRunningTaskC;
            expect(_isLongRunningTaskA).toBeTrue();
            expect(_isLongRunningTaskB).toBeTrue();
            expect(_isLongRunningTaskC).toBeTrue();
            const taskAPromiseResults = await taskAPromise;
            const taskBPromiseResults = await taskBPromise;
            const taskCPromiseResults = await taskCPromise;
            expect(taskAPromiseResults).toBe('OnceOffDataResolveLongTaskASuccess');
            expect(taskBPromiseResults).toBe('OnceOffDataResolveLongTaskBSuccess');
            expect(taskCPromiseResults).toBe('OnceOffDataResolveLongTaskCSuccess');
            expect(executedTasks.length).toEqual(3);
            done();
        }, 10000);
    });
});

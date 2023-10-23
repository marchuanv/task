import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = fdescribe('when queueing long running tasks given a once off data resolve', () => {
    it('should run once', (done) => {
        let isLongRunningTaskA = null;
        let isLongRunningTaskB = null;
        let isLongRunningTaskC = null;
        const block = new Promise((resolve) => setTimeout(resolve, 2000));
        const taskAPromise = TestTask.create(suite, 'OnceOffDataResolveLongTaskA', [TaskFlag.OnceOffDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning(3000);
            await block;
            this.complete('OnceOffDataResolveLongTaskASuccess');
        });
        const taskBPromise = TestTask.create(suite, 'OnceOffDataResolveLongTaskB', [TaskFlag.OnceOffDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning(3000);
            await block;
            this.complete('OnceOffDataResolveLongTaskBSuccess');
        });
        const taskCPromise = TestTask.create(suite, 'OnceOffDataResolveLongTaskC', [TaskFlag.OnceOffDataResolve]).queue(async function () {
            isLongRunningTaskC = this.isLongRunning(3000);
            await block;
            this.complete('OnceOffDataResolveLongTaskCSuccess');
        });
        setTimeout(async () => {
            const executedTasks = process.specs.get(suite);
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
process.specs.set(suite, []);
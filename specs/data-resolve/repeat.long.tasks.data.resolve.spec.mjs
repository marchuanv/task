import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
fdescribe('when queueing long running tasks given a repeat data resolve', () => {
    it('should run once', (done) => {
        let executedTasks = [];
        let isLongRunningTaskA = false;
        let isLongRunningTaskB = false;
        let isLongRunningTaskC = false;
        const block = new Promise((resolve) => setTimeout(resolve, 2000));
        const taskAPromise = TestTask.create('RepeatDataResolveLongTaskA', [TaskFlag.RepeatDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning();
            executedTasks.push(this);
            await block;
            this.complete('RepeatDataResolveLongTaskASuccess');
        });
        const taskBPromise = TestTask.create('RepeatDataResolveLongTaskB', [TaskFlag.RepeatDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning();
            executedTasks.push(this);
            await block;
            this.complete('RepeatDataResolveLongTaskBSuccess');
        });
        const taskCPromise = TestTask.create('RepeatDataResolveLongTaskC', [TaskFlag.RepeatDataResolve]).queue(async function () {
            isLongRunningTaskC = this.isLongRunning();
            executedTasks.push(this);
            await block;
            this.complete('RepeatDataResolveLongTaskCSuccess');
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
            expect(taskAPromiseResults).toBe('RepeatDataResolveLongTaskASuccess');
            expect(taskBPromiseResults).toBe('RepeatDataResolveLongTaskBSuccess');
            expect(taskCPromiseResults).toBe('RepeatDataResolveLongTaskCSuccess');
            expect(executedTasks.length).toBeGreaterThan(3000000);
            done();
        }, 10000);
    });
});

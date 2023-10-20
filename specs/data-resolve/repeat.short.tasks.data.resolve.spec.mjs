import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing short running tasks given a repeat data resolve', () => {
    it('should run once', (done) => {
        let executedTasks = [];
        process.specs.set(suite, executedTasks);
        let isLongRunningTaskA = null;
        let isLongRunningTaskB = null;
        let isLongRunningTaskC = null;
        const taskAPromise = TestTask.create('RepeatDataResolveShortTaskA', [TaskFlag.RepeatDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning();
            executedTasks.push(this);
            this.complete('RepeatDataResolveShortTaskASuccess');
        });
        const taskBPromise = TestTask.create('RepeatDataResolveShortTaskB', [TaskFlag.RepeatDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning();
            executedTasks.push(this);
            this.complete('RepeatDataResolveShortTaskBSuccess');
        });
        const taskCPromise = TestTask.create('RepeatDataResolveShortTaskC', [TaskFlag.RepeatDataResolve]).queue(async function () {
            isLongRunningTaskC = this.isLongRunning();
            executedTasks.push(this);
            this.complete('RepeatDataResolveShortTaskCSuccess');
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
            expect(taskAPromiseResults).toBe('RepeatDataResolveShortTaskASuccess');
            expect(taskBPromiseResults).toBe('RepeatDataResolveShortTaskBSuccess');
            expect(taskCPromiseResults).toBe('RepeatDataResolveShortTaskCSuccess');
            expect(executedTasks.length).toBeGreaterThan(3);
            done();
        }, 10000);
    });
});

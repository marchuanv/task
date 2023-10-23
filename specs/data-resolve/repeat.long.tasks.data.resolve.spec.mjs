import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing long running tasks given a repeat data resolve', () => {
    it('should run once', (done) => {
        let isLongRunningTaskA = null;
        let isLongRunningTaskB = null;
        let isLongRunningTaskC = null;
        const block = new Promise((resolve) => setTimeout(resolve, 2000));
        const taskAPromise = TestTask.create(suite, 'RepeatDataResolveLongTaskA', [TaskFlag.RepeatDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning(3000);
            await block;
            this.complete('RepeatDataResolveLongTaskASuccess');
        });
        const taskBPromise = TestTask.create(suite, 'RepeatDataResolveLongTaskB', [TaskFlag.RepeatDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning(3000);
            await block;
            this.complete('RepeatDataResolveLongTaskBSuccess');
        });
        const taskCPromise = TestTask.create(suite, 'RepeatDataResolveLongTaskC', [TaskFlag.RepeatDataResolve]).queue(async function () {
            isLongRunningTaskC = this.isLongRunning(3000);
            await block;
            this.complete('RepeatDataResolveLongTaskCSuccess');
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
            expect(taskAPromiseResults).toBe('RepeatDataResolveLongTaskASuccess');
            expect(taskBPromiseResults).toBe('RepeatDataResolveLongTaskBSuccess');
            expect(taskCPromiseResults).toBe('RepeatDataResolveLongTaskCSuccess');
            expect(executedTasks.length).toBeGreaterThan(3);
            done();
        }, 10000);
    });
});
process.specs.set(suite, []);
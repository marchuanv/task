import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing long running tasks given a repeat no data resolve', () => {
    it('should run indefinitely', (done) => {
        let isLongRunningTaskA = null;
        let isLongRunningTaskB = null;
        let isLongRunningTaskC = null;
        const block = new Promise((resolve) => setTimeout(resolve, 2000));
        const taskAPromise = TestTask.create(suite, 'RepeatNoDataResolveLongTaskA', [TaskFlag.RepeatNoDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning(3000);
            await block;
        });
        const taskBPromise = TestTask.create(suite, 'RepeatNoDataResolveLongTaskB', [TaskFlag.RepeatNoDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning(3000);
            await block;
        });
        const taskCPromise = TestTask.create(suite, 'RepeatNoDataResolveLongTaskC', [TaskFlag.RepeatNoDataResolve]).queue(async function () {
            isLongRunningTaskC = this.isLongRunning(3000);
            await block;
        });
        setTimeout(async () => {
            const executedTasks = process.specs.get(suite);
            const _isLongRunningTaskA = await isLongRunningTaskA;
            const _isLongRunningTaskB = await isLongRunningTaskB;
            const _isLongRunningTaskC = await isLongRunningTaskC;
            expect(_isLongRunningTaskA).toBeTrue();
            expect(_isLongRunningTaskB).toBeTrue();
            expect(_isLongRunningTaskC).toBeTrue();
            expect(taskAPromise).toBeDefined();
            expect(taskBPromise).toBeDefined();
            expect(taskCPromise).toBeDefined();
            expect(executedTasks.length).toBeGreaterThan(20);
            done();
        }, 10000);
    });
});
process.specs.set(suite, []);
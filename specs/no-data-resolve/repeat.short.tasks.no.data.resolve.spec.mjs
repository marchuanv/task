import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing short running tasks given a repeat no data resolve', () => {
    it('should run indefinitely', (done) => {
        let isLongRunningTaskA = null;
        let isLongRunningTaskB = null;
        let isLongRunningTaskC = null;
        const taskAPromise = TestTask.create(suite, 'RepeatNoDataResolveShortTaskA', [TaskFlag.RepeatNoDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning(3000);
        });
        const taskBPromise = TestTask.create(suite, 'RepeatNoDataResolveShortTaskB', [TaskFlag.RepeatNoDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning(3000);
        });
        const taskCPromise = TestTask.create(suite, 'RepeatNoDataResolveShortTaskC', [TaskFlag.RepeatNoDataResolve]).queue(async function () {
            isLongRunningTaskC = this.isLongRunning(3000);
        });
        setTimeout(async () => {
            const executedTasks = process.specs.get(suite);
            const _isLongRunningTaskA = await isLongRunningTaskA;
            const _isLongRunningTaskB = await isLongRunningTaskB;
            const _isLongRunningTaskC = await isLongRunningTaskC;
            expect(_isLongRunningTaskA).toBeFalse();
            expect(_isLongRunningTaskB).toBeFalse();
            expect(_isLongRunningTaskC).toBeFalse();
            expect(taskAPromise).toBeDefined();
            expect(taskBPromise).toBeDefined();
            expect(taskCPromise).toBeDefined();
            expect(executedTasks.length).toBeGreaterThan(20);
            done();
        }, 10000);
    });
});
process.specs.set(suite, []);
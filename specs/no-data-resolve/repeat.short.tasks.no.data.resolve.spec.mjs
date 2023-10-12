import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
describe('when queueing short running tasks given a repeat no data resolve', () => {
    it('should run indefinitely', (done) => {
        let executedTasks = [];
        let isLongRunningTaskA = false;
        let isLongRunningTaskB = false;
        let isLongRunningTaskC = false;
        const taskAPromise = TestTask.create('RepeatNoDataResolveShortTaskA', [TaskFlag.RepeatNoDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning();
            executedTasks.push(this);
        });
        const taskBPromise = TestTask.create('RepeatNoDataResolveShortTaskB', [TaskFlag.RepeatNoDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning();
            executedTasks.push(this);
        });
        const taskCPromise = TestTask.create('RepeatNoDataResolveShortTaskC', [TaskFlag.RepeatNoDataResolve]).queue(async function () {
            isLongRunningTaskC = this.isLongRunning();
            executedTasks.push(this);
        });
        setTimeout(async () => {
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

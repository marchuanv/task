import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing long running tasks given a repeat no data resolve', () => {
    it('should run indefinitely', (done) => {
        let executedTasks = [];
        process.specs.set(suite, executedTasks);
        let isLongRunningTaskA = null;
        let isLongRunningTaskB = null;
        let isLongRunningTaskC = null;
        const block = new Promise((resolve) => setTimeout(resolve, 2000));
        const taskAPromise = TestTask.create('RepeatNoDataResolveLongTaskA', [TaskFlag.RepeatNoDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning();
            executedTasks.push(this);
            await block;
        });
        const taskBPromise = TestTask.create('RepeatNoDataResolveLongTaskB', [TaskFlag.RepeatNoDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning();
            executedTasks.push(this);
            await block;
        });
        const taskCPromise = TestTask.create('RepeatNoDataResolveLongTaskC', [TaskFlag.RepeatNoDataResolve]).queue(async function () {
            isLongRunningTaskC = this.isLongRunning();
            executedTasks.push(this);
            await block;
        });
        setTimeout(async () => {
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

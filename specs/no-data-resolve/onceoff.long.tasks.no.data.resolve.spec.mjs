import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
describe('when queueing long running tasks given a once off no data resolve', () => {
    it('should run once', (done) => {
        let executedTasks = [];
        let isLongRunningTaskA = false;
        let isLongRunningTaskB = false;
        let isLongRunningTaskC = false;
        const block = new Promise((resolve) => setTimeout(resolve, 2000));
        const taskAPromise = TestTask.create('OnceOffNoDataResolveLongTaskA', [TaskFlag.OnceOffNoDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning();
            executedTasks.push(this);
            await block;
        });
        const taskBPromise = TestTask.create('OnceOffNoDataResolveLongTaskB', [TaskFlag.OnceOffNoDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning();
            executedTasks.push(this);
            await block;
        });
        const taskCPromise = TestTask.create('OnceOffNoDataResolveLongTaskC', [TaskFlag.OnceOffNoDataResolve]).queue(async function () {
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
            expect(executedTasks.length).toEqual(3);
            done();
        }, 10000);
    });
});

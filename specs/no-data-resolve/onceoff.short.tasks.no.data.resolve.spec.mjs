import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
describe('when queueing short running tasks given a once off no data resolve', () => {
    it('should run once', (done) => {
        let executedTasks = [];
        let isLongRunningTaskA = false;
        let isLongRunningTaskB = false;
        let isLongRunningTaskC = false;
        const taskAPromise = TestTask.create('OnceOffNoDataResolveShortTaskA', [TaskFlag.OnceOffNoDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning();
            executedTasks.push(this);
        });
        const taskBPromise = TestTask.create('OnceOffNoDataResolveShortTaskB', [TaskFlag.OnceOffNoDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning();
            executedTasks.push(this);
        });
        const taskCPromise = TestTask.create('OnceOffNoDataResolveShortTaskC', [TaskFlag.OnceOffNoDataResolve]).queue(async function () {
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
            expect(executedTasks.length).toEqual(3);
            done();
        }, 10000);
    });
});

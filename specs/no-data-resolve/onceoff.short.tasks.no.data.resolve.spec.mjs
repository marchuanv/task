import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing short running tasks given a once off no data resolve', () => {
    it('should run once', (done) => {
        let isLongRunningTaskA = null;
        let isLongRunningTaskB = null;
        let isLongRunningTaskC = null;
        const taskAPromise = TestTask.create(suite, 'OnceOffNoDataResolveShortTaskA', [TaskFlag.OnceOffNoDataResolve]).queue(async function () {
            isLongRunningTaskA = this.isLongRunning(3000);
        });
        const taskBPromise = TestTask.create(suite, 'OnceOffNoDataResolveShortTaskB', [TaskFlag.OnceOffNoDataResolve]).queue(async function () {
            isLongRunningTaskB = this.isLongRunning(3000);
        });
        const taskCPromise = TestTask.create(suite, 'OnceOffNoDataResolveShortTaskC', [TaskFlag.OnceOffNoDataResolve]).queue(async function () {
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
            expect(executedTasks.length).toEqual(3);
            done();
        }, 10000);
    });
});
process.specs.set(suite, []);
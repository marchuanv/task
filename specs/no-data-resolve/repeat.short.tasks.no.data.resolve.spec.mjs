import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing a short running tasks given a repeat no data resolve', () => {
    it('should run indefinitely', async () => {
        const promises = [
            TestTask.create(suite, 'RepeatNoDataResolveShortTaskA', [TaskFlag.RepeatNoDataResolve]).run(0, async function () { }),
            TestTask.create(suite, 'RepeatNoDataResolveShortTaskB', [TaskFlag.RepeatNoDataResolve]).run(0, async function () { }),
            TestTask.create(suite, 'RepeatNoDataResolveShortTaskC', [TaskFlag.RepeatNoDataResolve]).run(0, async function () { })
        ];

        const results = await Promise.all(promises);
        const [taskA, taskB, taskC] = results;

        expect(taskA.isLongRunning).toBeFalse();
        expect(taskB.isLongRunning).toBeFalse();
        expect(taskC.isLongRunning).toBeFalse();

        expect(taskA.data).toBeNull();
        expect(taskB.data).toBeNull();
        expect(taskC.data).toBeNull();

        expect(taskA.enqueueCount).toBeGreaterThan(1);
        expect(taskB.enqueueCount).toBeGreaterThan(1);
        expect(taskC.enqueueCount).toBeGreaterThan(1);
    });
});
process.specs.set(suite, []);
import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing a short running tasks given a once off no data resolve', () => {
    it('should run once', async () => {
        const promises = [
            TestTask.create(suite, 'OnceOffNoDataResolveShortTaskA', [TaskFlag.OnceOffNoOutput]).run(0, async function () { }),
            TestTask.create(suite, 'OnceOffNoDataResolveShortTaskB', [TaskFlag.OnceOffNoOutput]).run(0, async function () { }),
            TestTask.create(suite, 'OnceOffNoDataResolveShortTaskC', [TaskFlag.OnceOffNoOutput]).run(0, async function () { })
        ];
        const results = await Promise.all(promises);
        const [taskA, taskB, taskC] = results;

        expect(taskA.isLongRunning).toBeFalse();
        expect(taskB.isLongRunning).toBeFalse();
        expect(taskC.isLongRunning).toBeFalse();

        expect(taskA.data).toBeNull();
        expect(taskB.data).toBeNull();
        expect(taskC.data).toBeNull();

        expect(taskA.enqueueCount).toBe(1);
        expect(taskB.enqueueCount).toBe(1);
        expect(taskC.enqueueCount).toBe(1);
    });
});
process.specs.set(suite, []);
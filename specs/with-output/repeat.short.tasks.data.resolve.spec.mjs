import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing a short running tasks given a repeat data resolve', () => {
    it('should run indefinitely', async () => {
        const promises = [
            TestTask.create(suite, 'RepeatDataResolveShortTaskA', [TaskFlag.RepeatWithOutput]).run(0, async function () {
                this.complete('RepeatDataResolveShortTaskASuccess');
            }),
            TestTask.create(suite, 'RepeatDataResolveShortTaskB', [TaskFlag.RepeatWithOutput]).run(0, async function () {
                this.complete('RepeatDataResolveShortTaskBSuccess');
            }),
            TestTask.create(suite, 'RepeatDataResolveShortTaskC', [TaskFlag.RepeatWithOutput]).run(0, async function () {
                this.complete('RepeatDataResolveShortTaskCSuccess');
            })
        ];
        const results = await Promise.all(promises);
        const [taskA, taskB, taskC] = results;

        expect(taskA.isLongRunning).toBeFalse();
        expect(taskB.isLongRunning).toBeFalse();
        expect(taskC.isLongRunning).toBeFalse();

        expect(taskA.data).toBe('RepeatDataResolveShortTaskASuccess');
        expect(taskB.data).toBe('RepeatDataResolveShortTaskBSuccess');
        expect(taskC.data).toBe('RepeatDataResolveShortTaskCSuccess');

        expect(taskA.enqueueCount).toBeGreaterThan(1);
        expect(taskB.enqueueCount).toBeGreaterThan(1);
        expect(taskC.enqueueCount).toBeGreaterThan(1);
    });
});
process.specs.set(suite, []);
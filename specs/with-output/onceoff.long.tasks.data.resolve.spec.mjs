import { TaskFlag } from '../../lib/task-flag.mjs';
import { TestTask } from '../test-task.mjs';
const suite = describe('when queueing a long running tasks given a once off data resolve', () => {
    it('should run once', async () => {
        const promises = [
            TestTask.create(suite, 'OnceOffDataResolveLongTaskA', [TaskFlag.OnceOffWithOutput]).run(0, async function () {
                await this.simulateDelay();
                this.complete('OnceOffDataResolveLongTaskASuccess');
            }),
            TestTask.create(suite, 'OnceOffDataResolveLongTaskB', [TaskFlag.OnceOffWithOutput]).run(0, async function () {
                await this.simulateDelay();
                this.complete('OnceOffDataResolveLongTaskBSuccess');
            }),
            TestTask.create(suite, 'OnceOffDataResolveLongTaskC', [TaskFlag.OnceOffWithOutput]).run(0, async function () {
                await this.simulateDelay();
                this.complete('OnceOffDataResolveLongTaskCSuccess');
            })
        ];
        const results = await Promise.all(promises);

        const [taskA, taskB, taskC] = results;

        expect(taskA.isLongRunning).toBeTrue();
        expect(taskB.isLongRunning).toBeTrue();
        expect(taskC.isLongRunning).toBeTrue();

        expect(taskA.data).toBe('OnceOffDataResolveLongTaskASuccess');
        expect(taskB.data).toBe('OnceOffDataResolveLongTaskBSuccess');
        expect(taskC.data).toBe('OnceOffDataResolveLongTaskCSuccess');

        expect(taskA.enqueueCount).toBe(1);
        expect(taskB.enqueueCount).toBe(1);
        expect(taskC.enqueueCount).toBe(1);
    });
});
process.specs.set(suite, []);
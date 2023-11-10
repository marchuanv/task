import { TaskFlag } from '../../lib/task-flag.mjs';
import { Task } from '../../task.mjs';
import { TestTask } from '../test-task.mjs';
const suite = fdescribe('when queuing a task given multiple tasks are in the queue', () => {

    let promises = [];
    beforeAll(async () => {
        promises = [
            TestTask.create(suite, 'SharedTaskQueue1', [TaskFlag.OnceOffWithOutput]).run(0, async function () {
                this.complete(null);
            }),
            TestTask.create(suite, 'SharedTaskQueue2', [TaskFlag.OnceOffWithOutput]).run(0, async function () {
                this.complete(null);
            })
        ];
    });

    it('should share the queue', async () => {
        const results = await Promise.all(promises);
        const [taskA, taskB] = results;
        expect(task).toBeInstanceOf(Task);
        setTimeout(async () => {
            expect(task.error).toBeDefined();
            expect(task.error).toBeNull();
            expect(task.isLongRunning).toBeFalse();
            expect(task.enqueueCount).toBe(1);
            expect(task.data).toBeNull();
            done();
        }, 2000);
    });
});
process.specs.set(suite, []);
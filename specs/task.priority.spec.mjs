
import { TaskFlag } from '../lib/task-flag.mjs';
import { TestTask } from './test-task.mjs';
const suite = describe('when enqueuing tasks given different priority flags', () => {
    it('should run them in priority order', async () => {
        const taskAData = { message: 'valid response from Task A' };
        const taskBData = { message: 'valid response from Task B' };
        const taskCData = { message: 'valid response from Task C' };
        let promises = [
            TestTask.create(suite, 'TaskA', [TaskFlag.LowPriority]).run(0, function () {
                this.complete(taskAData);
            }),
            TestTask.create(suite, 'TaskB', [TaskFlag.MediumPriority]).run(0, function () {
                this.complete(taskBData);
            }),
            TestTask.create(suite, 'TaskC', [TaskFlag.HighPriority]).run(0, function () {
                this.complete(taskCData);
            })
        ];

        const results = await Promise.all(promises);
        const [taskA, taskB, taskC] = results;

        expect(taskA.isLongRunning).toBeFalse();
        expect(taskB.isLongRunning).toBeFalse();
        expect(taskC.isLongRunning).toBeFalse();

        expect(JSON.stringify(taskA.data)).toBe(JSON.stringify(taskAData));
        expect(JSON.stringify(taskB.data)).toBe(JSON.stringify(taskBData));
        expect(JSON.stringify(taskC.data)).toBe(JSON.stringify(taskCData));

        expect(taskA.enqueueCount).toBe(1);
        expect(taskB.enqueueCount).toBe(1);
        expect(taskC.enqueueCount).toBe(1);

        expect(taskC.taskStartTime).toBeLessThan(taskB.taskStartTime);
        expect(taskC.taskStartTime).toBeLessThan(taskA.taskStartTime);
        expect(taskB.taskStartTime).toBeLessThan(taskA.taskStartTime);
    });
});
process.specs.set(suite, []);
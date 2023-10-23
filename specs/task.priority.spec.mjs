
import { TaskFlag } from '../lib/task-flag.mjs';
import { TestTask } from './test-task.mjs';
const suite = describe('when enqueuing tasks given different priority flags', () => {
    it('should run them in priority order', async () => {
        const taskAMessage = { message: 'valid response from Task A' };
        const taskBMessage = { message: 'valid response from Task B' };
        const taskCMessage = { message: 'valid response from Task C' };
        let promises = [
            TestTask.create(suite, 'TaskA', [TaskFlag.LowPriority]).queue(0, function () {
                this.complete(taskAMessage);
            }),
            TestTask.create(suite, 'TaskB', [TaskFlag.MediumPriority]).queue(0, function () {
                this.complete(taskBMessage);
            }),
            TestTask.create(suite, 'TaskC', [TaskFlag.HighPriority]).queue(0, function () {
                this.complete(taskCMessage);
            })
        ];

        const results = await Promise.all(promises);
        const [resultsA, resultsB, resultsC] = results;

        expect(resultsA.isLongRunning).toBeFalse();
        expect(resultsB.isLongRunning).toBeFalse();
        expect(resultsC.isLongRunning).toBeFalse();

        expect(JSON.stringify(resultsA.results)).toBe(JSON.stringify(taskAMessage));
        expect(JSON.stringify(resultsB.results)).toBe(JSON.stringify(taskBMessage));
        expect(JSON.stringify(resultsC.results)).toBe(JSON.stringify(taskCMessage));

        expect(resultsA.enqueueCount).toBe(1);
        expect(resultsB.enqueueCount).toBe(1);
        expect(resultsC.enqueueCount).toBe(1);

        expect(resultsC.taskStartTime).toBeLessThan(resultsB.taskStartTime);
        expect(resultsC.taskStartTime).toBeLessThan(resultsA.taskStartTime);
        expect(resultsB.taskStartTime).toBeLessThan(resultsA.taskStartTime);
    });
});
process.specs.set(suite, []);
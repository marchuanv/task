
import { TaskFlag } from '../lib/task-flag.mjs';
import { TestTask } from './test-task.mjs';
const suite = describe('when enqueuing tasks given different priority flags', () => {
    it('should run them in priority order', async () => {
        let promises = [
            TestTask.create(suite, 'TaskA', [TaskFlag.LowPriority]).queue(0, function () {
                this.complete({ message: 'valid response from Task A' });
            }),
            TestTask.create(suite, 'TaskB', [TaskFlag.MediumPriority]).queue(0, function () {
                this.complete({ message: 'valid response from Task B' });
            }),
            TestTask.create(suite, 'TaskC', [TaskFlag.HighPriority]).queue(0, function () {
                this.complete({ message: 'valid response from Task C' });
            })
        ];

        const results = await Promise.all(promises);
        const [resultsA, resultsB, resultsC] = results;

        expect(resultsA.isLongRunning).toBeFalse();
        expect(resultsB.isLongRunning).toBeFalse();
        expect(resultsC.isLongRunning).toBeFalse();

        expect(resultsA.results).toBe(JSON.stringify({ message: 'valid response from Task A' }));
        expect(resultsB.results).toBe(JSON.stringify({ message: 'valid response from Task B' }));
        expect(resultsC.results).toBe(JSON.stringify({ message: 'valid response from Task C' }));

        expect(resultsA.enqueueCount).toBe(1);
        expect(resultsB.enqueueCount).toBe(1);
        expect(resultsC.enqueueCount).toBe(1);

        const taskExecuteOrder = process.specs.get(suite);
        expect(taskExecuteOrder[0].name).toBe('Object_TaskC');
        expect(taskExecuteOrder[1].name).toBe('Object_TaskB');
        expect(taskExecuteOrder[2].name).toBe('Object_TaskA');
    });
});
process.specs.set(suite, []);
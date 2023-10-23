
import { TaskFlag } from '../lib/task-flag.mjs';
import { TestTask } from './test-task.mjs';
const suite = describe('when enqueuing tasks given different priority flags', () => {
    it('should run them in priority order', async () => {
        let promises = [];
        const promiseA = TestTask.create(suite, 'TaskA', [TaskFlag.LowPriority]).queue(function () {
            console.log('running task A');
            this.complete({ message: 'valid response' });
        });
        const promiseB = TestTask.create(suite, 'TaskB', [TaskFlag.MediumPriority]).queue(function () {
            console.log('running task B');
            this.complete({ message: 'valid response' });
        });
        const promiseC = TestTask.create(suite, 'TaskC', [TaskFlag.HighPriority]).queue(function () {
            console.log('running task C');
            this.complete({ message: 'valid response' });
        });
        promises.push(promiseA);
        promises.push(promiseB);
        promises.push(promiseC);
        await Promise.all(promises);
        const taskExecuteOrder = process.specs.get(suite);
        expect(taskExecuteOrder[0].name).toBe('Object_TaskC');
        expect(taskExecuteOrder[1].name).toBe('Object_TaskB');
        expect(taskExecuteOrder[2].name).toBe('Object_TaskA');
    });
});
process.specs.set(suite, []);

import { TestTask } from './test-task.mjs';
describe('when enqueuing tasks given different priority flags', () => {
    it('should run them in priority order', async () => {
        let taskExecuteOrder = [];
        let promises = [];
        const promiseA = TestTask.create('TaskA', []).queue(function () {
            console.log('running task A');
            taskExecuteOrder.push(this);
            this.complete({ message: 'valid response' });
        });
        const promiseB = TestTask.create('TaskB', []).queue(function () {
            console.log('running task B');
            taskExecuteOrder.push(this);
            this.complete({ message: 'valid response' });
        });
        const promiseC = TestTask.create('TaskC', []).queue(function () {
            taskExecuteOrder.push(this);
            console.log('running task C');
            this.complete({ message: 'valid response' });
        });
        promises.push(promiseA);
        promises.push(promiseB);
        promises.push(promiseC);
        await Promise.all(promises);
        expect(taskExecuteOrder[0].name).toBe('Object_TaskC');
        expect(taskExecuteOrder[1].name).toBe('Object_TaskB');
        expect(taskExecuteOrder[2].name).toBe('Object_TaskA');
    });
});

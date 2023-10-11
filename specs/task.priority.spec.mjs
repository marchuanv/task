
import { TaskFlag } from '../lib/task-flag.mjs';
import { Task } from '../task.mjs';
describe('when enqueuing tasks', () => {
    it('should run them in the order of priority task flags', async () => {
        let taskExecuteOrder = [];
        let promises = [];
        const promiseA = Task.create('TaskA', { Id: 'TaskAId' }, {}, []).queue(Object.prototype, function () {
            console.log('running task A');
            taskExecuteOrder.push(this);
            this.complete({ message: 'valid response' });
        });
        const promiseB = Task.create('TaskB', { Id: 'TaskBId' }, {}, [TaskFlag.MediumPriority]).queue(Object.prototype, function () {
            console.log('running task B');
            taskExecuteOrder.push(this);
            this.complete({ message: 'valid response' });
        });
        const promiseC = Task.create('TaskC', { Id: 'TaskCId' }, {}, [TaskFlag.HighPriority]).queue(Object.prototype, function () {
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


import { Task } from '../task.mjs';
fdescribe('when enqueuing a task', () => {
    it('should', async (done) => {
        Task.create('TaskA', { Id: 'TaskAId' }, {}, []).queue(Object.prototype, () => {
            console.log('running task A');
            this.complete({ message: 'valid response' });
        });
        Task.create('TaskB', { Id: 'TaskBId' }, {}, []).queue(Object.prototype, () => {
            console.log('running task B');
            this.complete({ message: 'valid response' });
        });
        Task.create('TaskC', { Id: 'TaskCId' }, {}, []).queue(Object.prototype, () => {
            console.log('running task C');
            this.complete({ message: 'valid response' });
        });
    });
});

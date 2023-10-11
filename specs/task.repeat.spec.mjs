
import { TaskFlag } from '../lib/task-flag.mjs';
import { Task } from '../task.mjs';
describe('when queueing tasks given a repeat task flag', () => {
    it('should run indefinitely', (done) => {
        let executedTasks = [];
        Task.create('RepeatTaskA', { Id: 'RepeatTaskAId' }, {}, [TaskFlag.Repeat]).queue(Object.prototype, function () {
            executedTasks.push(this);
        });
        Task.create('RepeatTaskB', { Id: 'RepeatTaskBId' }, {}, [TaskFlag.Repeat]).queue(Object.prototype, function () {
            executedTasks.push(this);
        });
        Task.create('RepeatTaskC', { Id: 'RepeatTaskCId' }, {}, [TaskFlag.Repeat]).queue(Object.prototype, function () {
            executedTasks.push(this);
        });
        setTimeout(() => {
            expect(executedTasks.length).toBeGreaterThan(24072);
            done();
        }, 1000)
    });
});

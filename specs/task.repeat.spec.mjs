
import { TaskFlag } from '../lib/task-flag.mjs';
import { Task } from '../task.mjs';
describe('when queueing tasks a repeat not response task flag', () => {
    it('should run indefinitely', (done) => {
        let executedTasks = [];
        Task.create('RepeatTaskA', { Id: 'RepeatTaskAId' }, {}, [TaskFlag.RepeatNoResponse]).queue(Object.prototype, function () {
            executedTasks.push(this);
        });
        Task.create('RepeatTaskB', { Id: 'RepeatTaskBId' }, {}, [TaskFlag.RepeatNoResponse]).queue(Object.prototype, function () {
            executedTasks.push(this);
        });
        Task.create('RepeatTaskC', { Id: 'RepeatTaskCId' }, {}, [TaskFlag.RepeatNoResponse]).queue(Object.prototype, function () {
            executedTasks.push(this);
        });
        setTimeout(() => {
            expect(executedTasks.length).toBeGreaterThan(24072);
            done();
        }, 1000)
    });
});

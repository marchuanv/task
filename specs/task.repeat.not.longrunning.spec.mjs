import { TaskFlag } from '../lib/task-flag.mjs';
import { TaskState } from '../lib/task-state.mjs';
import { Task } from '../task.mjs';
describe('when queueing tasks given a repeat task flag and NOT long running tasks', () => {
    it('should run indefinitely', (done) => {
        let executedTasks = [];
        let isRepeatTaskALongRunning = false;
        let isRepeatTaskBLongRunning = false;
        let isRepeatTaskCLongRunning = false;
        Task.create('RepeatTaskA', { Id: 'RepeatTaskAId' }, {}, [TaskFlag.Repeat]).queue(Object.prototype, function () {
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskALongRunning = true;
                }
            }, 100);
        });
        Task.create('RepeatTaskB', { Id: 'RepeatTaskBId' }, {}, [TaskFlag.Repeat]).queue(Object.prototype, function () {
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskBLongRunning = true;
                }
            }, 100);
        });
        Task.create('RepeatTaskC', { Id: 'RepeatTaskCId' }, {}, [TaskFlag.Repeat]).queue(Object.prototype, function () {
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskCLongRunning = true;
                }
            }, 100);
        });
        setTimeout(() => {
            expect(executedTasks.length).toBeGreaterThan(1000);
            expect(isRepeatTaskALongRunning).toBeFalse();
            expect(isRepeatTaskBLongRunning).toBeFalse();
            expect(isRepeatTaskCLongRunning).toBeFalse();
            done();
        }, 5000)
    });
});

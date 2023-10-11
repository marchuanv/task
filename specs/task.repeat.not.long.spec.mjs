import { TaskFlag } from '../lib/task-flag.mjs';
import { TaskState } from '../lib/task-state.mjs';
import { Task } from '../task.mjs';
describe('when queueing tasks given a repeat no response task flag and short running tasks', () => {
    it('should run indefinitely', (done) => {
        let executedTasks = [];
        let isRepeatTaskALongRunning = false;
        let isRepeatTaskBLongRunning = false;
        let isRepeatTaskCLongRunning = false;
        Task.create('RepeatShortTaskA', { Id: 'RepeatTaskAId' }, {}, [TaskFlag.RepeatNoResponse]).queue(Object.prototype, function () {
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskALongRunning = true;
                }
            }, 100);
        });
        Task.create('RepeatShortTaskB', { Id: 'RepeatTaskBId' }, {}, [TaskFlag.RepeatNoResponse]).queue(Object.prototype, function () {
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskBLongRunning = true;
                }
            }, 100);
        });
        Task.create('RepeatShortTaskC', { Id: 'RepeatTaskCId' }, {}, [TaskFlag.RepeatNoResponse]).queue(Object.prototype, function () {
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

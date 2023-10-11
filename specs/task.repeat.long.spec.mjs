import { TaskFlag } from '../lib/task-flag.mjs';
import { TaskState } from '../lib/task-state.mjs';
import { Task } from '../task.mjs';
fdescribe('when queueing tasks given a repeat not response task flag and long running tasks', () => {
    it('should run indefinitely', (done) => {
        let executedTasks = [];
        let isRepeatTaskALongRunning = false;
        let isRepeatTaskBLongRunning = false;
        let isRepeatTaskCLongRunning = false;
        const block = new Promise((resolve) => setTimeout(resolve, 3000));
        Task.create('RepeatLongTaskA', { Id: 'RepeatTaskAId' }, {}, [TaskFlag.RepeatNoResponse]).queue(Object.prototype, async function () {
            await block;
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskALongRunning = true;
                }
            }, 1000);
        });
        Task.create('RepeatLongTaskB', { Id: 'RepeatTaskBId' }, {}, [TaskFlag.RepeatNoResponse]).queue(Object.prototype, async function () {
            await block;
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskBLongRunning = true;
                }
            }, 1000);
        });
        Task.create('RepeatLongTaskC', { Id: 'RepeatTaskCId' }, {}, [TaskFlag.RepeatNoResponse]).queue(Object.prototype, async function () {
            await block;
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskCLongRunning = true;
                }
            }, 1000);
        });
        setTimeout(() => {
            expect(executedTasks.length).toBeGreaterThan(20);
            expect(isRepeatTaskALongRunning).toBeTrue();
            expect(isRepeatTaskBLongRunning).toBeTrue();
            expect(isRepeatTaskCLongRunning).toBeTrue();
            done();
        }, 10000)
    });
});

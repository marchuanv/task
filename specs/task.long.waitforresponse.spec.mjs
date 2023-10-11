import { TaskFlag } from '../lib/task-flag.mjs';
import { TaskState } from '../lib/task-state.mjs';
import { Task } from '../task.mjs';
describe('when queueing tasks given a wait for response flag on long running tasks', () => {
    it('should wait for response', (done) => {
        let executedTasks = [];
        let isRepeatTaskALongRunning = false;
        let isRepeatTaskBLongRunning = false;
        let isRepeatTaskCLongRunning = false;
        const block = new Promise((resolve) => setTimeout(resolve, 3000));
        Task.create('WaitLongTaskTaskA', { Id: 'RepeatTaskAId' }, {}, [TaskFlag.WaitForValidResponse]).queue(Object.prototype, async function () {
            await block;
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskALongRunning = true;
                }
            }, 1000);
        });
        Task.create('WaitLongTaskTaskB', { Id: 'RepeatTaskBId' }, {}, [TaskFlag.WaitForValidResponse]).queue(Object.prototype, async function () {
            await block;
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskBLongRunning = true;
                }
            }, 1000);
        });
        Task.create('WaitLongTaskTaskC', { Id: 'RepeatTaskCId' }, {}, [TaskFlag.WaitForValidResponse]).queue(Object.prototype, async function () {
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

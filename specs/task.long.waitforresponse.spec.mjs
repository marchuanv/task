import { TaskFlag } from '../lib/task-flag.mjs';
import { TaskState } from '../lib/task-state.mjs';
import { Task } from '../task.mjs';
fdescribe('when queueing tasks given a wait for response flag on long running tasks', () => {
    it('should wait for response', async () => {
        let executedTasks = [];
        let isRepeatTaskALongRunning = false;
        let isRepeatTaskBLongRunning = false;
        let isRepeatTaskCLongRunning = false;
        const block = new Promise((resolve) => setTimeout(resolve, 3000));
        const taskAResponse = await Task.create('WaitLongTaskA', { Id: 'WaitLongTaskAId' }, {}, [TaskFlag.WaitForValidResponse]).queue(Object.prototype, async function () {
            await block;
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskALongRunning = true;
                    this.complete({ message: 'Task A complete' });
                }
            }, 1000);
        });
        const taskBResponse = await Task.create('WaitLongTaskB', { Id: 'WaitLongTaskBId' }, {}, [TaskFlag.WaitForValidResponse]).queue(Object.prototype, async function () {
            await block;
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskBLongRunning = true;
                    this.complete({ message: 'Task B complete' });
                }
            }, 1000);
        });
        const taskCResponse = await Task.create('WaitLongTaskC', { Id: 'WaitLongTaskCId' }, {}, [TaskFlag.WaitForValidResponse]).queue(Object.prototype, async function () {
            await block;
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskCLongRunning = true;
                    this.complete({ message: 'Task C complete' });
                }
            }, 1000);
        });
        setTimeout(() => {
            expect(executedTasks.length).toBeGreaterThan(20);
            expect(taskAResponse).toBeDefined();
            expect(taskBResponse).toBeDefined();
            expect(taskCResponse).toBeDefined();
            expect(isRepeatTaskALongRunning).toBeTrue();
            expect(isRepeatTaskBLongRunning).toBeTrue();
            expect(isRepeatTaskCLongRunning).toBeTrue();
            done();
        }, 1000)
    });
});

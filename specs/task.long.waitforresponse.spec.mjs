import { TaskFlag } from '../lib/task-flag.mjs';
import { TaskState } from '../lib/task-state.mjs';
import { Task } from '../task.mjs';
describe('when queueing tasks given a wait for response flag on long running tasks', () => {
    it('should wait for response', async () => {

        let executedTasks = [];
        let isRepeatTaskALongRunning = false;
        let isRepeatTaskBLongRunning = false;
        let isRepeatTaskCLongRunning = false;

        const block = new Promise((resolve) => setTimeout(resolve, 2000));
        const taskAPromise = Task.create('WaitLongTaskA', { Id: 'WaitLongTaskAId' }, {}, [TaskFlag.WaitForValidResponse]).queue(Object.prototype, async function () {
            await block;
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskALongRunning = true;
                    this.complete({ message: 'Task A complete' });
                }
            }, 1000);
        });
        const taskBPromise = Task.create('WaitLongTaskB', { Id: 'WaitLongTaskBId' }, {}, [TaskFlag.WaitForValidResponse]).queue(Object.prototype, async function () {
            await block;
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskBLongRunning = true;
                    this.complete({ message: 'Task B complete' });
                }
            }, 1000);
        });
        const taskCPromise = Task.create('WaitLongTaskC', { Id: 'WaitLongTaskCId' }, {}, [TaskFlag.WaitForValidResponse]).queue(Object.prototype, async function () {
            await block;
            executedTasks.push(this);
            setTimeout(() => {
                if (this.hadState(TaskState.LongRunning)) {
                    isRepeatTaskCLongRunning = true;
                    this.complete({ message: 'Task C complete' });
                }
            }, 1000);
        });

        const taskAResponse = await taskAPromise;
        const taskBResponse = await taskBPromise;
        const taskCResponse = await taskCPromise;

        expect(taskAResponse).toBeDefined();
        expect(taskBResponse).toBeDefined();
        expect(taskCResponse).toBeDefined();
        expect(isRepeatTaskALongRunning).toBeTrue();
        expect(isRepeatTaskBLongRunning).toBeTrue();
        expect(isRepeatTaskCLongRunning).toBeTrue();

    });
});

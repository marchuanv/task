
import { Task } from '../task.mjs';
import { TaskFlag } from '../lib/task-flag.mjs';

class TaskContext {}
const taskAContext = new TaskContext();

describe('when creating a task', () => {
    it('should resolve promise', async (done) => {
        const data = { };
        Task.create('taskA', taskAContext, data, [
            TaskFlag.HandleErrors
        ]).queue(TaskContext.prototype,() => {
            console.log('some task executing');
        });
    });
});

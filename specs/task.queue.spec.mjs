
import { TaskQueue } from '../lib/task-queue.mjs';
import { Task } from '../task.mjs';
fdescribe('when enqueuing a task', () => {
    it('should', async (done) => {
       const taskA = new Task('TaskA', { Id: 'TaskAId' }, {}, []);
       const taskB = new Task('TaskB', { Id: 'TaskAId' }, {}, []);
       const taskC = new Task('TaskB', { Id: 'TaskAId' }, {}, []);
       TaskQueue.enqueue(taskA);
       TaskQueue.enqueue(taskB);
       TaskQueue.enqueue(taskC);
    });
});

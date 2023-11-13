import { Task, TaskQueue } from '../../lib/registry.mjs';
const suite = describe('when queuing a task given a task queue', () => {
    it('should be a global scope', (done) => {

        const task1 = new Task('GlobalQueueScope1', { Id: null }, {}, 2000);
        const task2 = new Task('GlobalQueueScope2', { Id: null }, {}, 2000);

        const taskQueue1 = new TaskQueue(task1);
        const taskQueue2 = new TaskQueue(task2);

        task1.run(null, () => { });
        task2.run(null, () => { });

        expect(taskQueue1.Id).not.toBe(taskQueue2.Id);

        setTimeout(() => {
            expect(taskQueue1.queue.length).toBe(taskQueue2.queue.length);
            done();
        }, 2000);
    });
});
process.specs.set(suite, []);
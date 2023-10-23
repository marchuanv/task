import Jasmine from 'jasmine';
import * as url from 'url';
import { TaskLogging } from '../lib/task-logging.mjs';
import { TaskProperties } from '../lib/task-properties.mjs';
process.specs = new WeakMap();
const __dirname = url.fileURLToPath(new URL('./', import.meta.url));
const jasmine = new Jasmine({ projectBaseDir: __dirname });
jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
jasmine.addMatchingSpecFiles(['**/*.spec.mjs']);
jasmine.execute();
let privateBag;
new TaskProperties((_privateBag) => {
    privateBag = _privateBag;
});
process.on('exit', () => {
    const topLevelSuite = jasmine.env.topSuite();
    for (const child of topLevelSuite.children) {
        const executedTasks = process.specs.get(child);
        if (executedTasks) {
            for (const executedTask of executedTasks) {
                if (child.suite_.status() === 'passed') {
                    TaskLogging.log(executedTask, `Test Passed`);
                } else {
                    TaskLogging.log(executedTask, `Test Failed`);
                }
            }
        }
    }
});
TaskLogging.initialise();

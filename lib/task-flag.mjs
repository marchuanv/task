import crypto from 'node:crypto';
import { TaskFlagGroup } from './task-flag-group.mjs';
const privateBag = new WeakMap();
export class TaskFlag {
    /**
     * @param { TaskFlagGroup} group 
     */
    constructor(Id, group) {
        privateBag.set(this, { Id, group });
    }
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    get group() {
        const { group } = privateBag.get(this);
        return group;
    }
    /**
     * @returns { OnceOffTaskFlag }
    */
    static get OnceOff() {
        return onceOffTask;
    }
    /**
     * @returns { RepeatTaskFlag }
    */
    static get Repeat() {
        return repeatTask;
    }
    /**
     * @returns { IgnoreErrorsTaskFlag }
    */
    static get IgnoreErrors() {
        return ignoreErrors
    }
    /**
     * @returns { HandleErrorsTaskFlag }
    */
    static get HandleErrors() {
        return handleErrors;
    }
    /**
     * @returns { HighPriorityTaskFlag }
    */
    static get HighPriority() {
        return highPriority;
    }
    /**
     * @returns { MediumPriorityTaskFlag }
    */
    static get MediumPriority() {
        return mediumPriority;
    }
    /**
     * @returns { LowPriorityTaskFlag }
    */
    static get LowPriority() {
        return lowPriority;
    }
    /**
     * @returns { ValidResponseTaskFlag }
    */
    static get ValidResponse() {
        return validResponse;
    }
    /**
     * @returns { WaitForValidResponseTaskFlag }
    */
    static get WaitForValidResponse() {
        return waitForValidResponse;
    }
    /**
     * @returns { RepeatUntilValidResponseTaskFlag }
    */
    static get RepeatUntilValidResponse() {
        return repeatUntilValidResponseTaskFlag;
    }
}

export class HighPriorityTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Priority); } }
export class MediumPriorityTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Priority); } }
export class LowPriorityTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Priority); } }

export class OnceOffTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Run); } }
export class RepeatTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Run); } }

export class IgnoreErrorsTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.ErrorHandling); } }
export class HandleErrorsTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.ErrorHandling); } }

export class ValidResponseTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Response); } }
export class WaitForValidResponseTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Response); } }
export class RepeatUntilValidResponseTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Response); } }

const highPriority = new HighPriorityTaskFlag();
const mediumPriority = new MediumPriorityTaskFlag();
const lowPriority = new LowPriorityTaskFlag();
const onceOffTask = new OnceOffTaskFlag();
const repeatTask = new RepeatTaskFlag();
const ignoreErrors = new IgnoreErrorsTaskFlag();
const handleErrors = new HandleErrorsTaskFlag();
const validResponse = new ValidResponseTaskFlag();
const waitForValidResponse = new WaitForValidResponseTaskFlag();
const repeatUntilValidResponseTaskFlag = new RepeatUntilValidResponseTaskFlag();

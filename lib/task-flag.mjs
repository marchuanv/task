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
    toString() {
        return this.constructor.name;
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
     * @returns { OnceOffNoOutputTaskFlag }
    */
    static get OnceOffNoOutput() {
        return onceOffNoOutput;
    }
    /**
     * @returns { OnceOffWithOutputTaskFlag }
    */
    static get OnceOffWithOutput() {
        return onceOffWithOutput;
    }
    /**
     * @returns { RepeatWithOutputTaskFlag }
    */
    static get RepeatWithOutput() {
        return repeatWithOutput;
    }
    /**
     * @returns { RepeatNoOutputTaskFlag }
    */
    static get RepeatNoOutput() {
        return repeatNoOutput;
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
}

export class HighPriorityTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Priority); } }
export class MediumPriorityTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Priority); } }
export class LowPriorityTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Priority); } }

export class OnceOffNoOutputTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Run); } }
export class OnceOffWithOutputTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Run); } }
export class RepeatWithOutputTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Run); } }
export class RepeatNoOutputTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Run); } }

export class IgnoreErrorsTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.ErrorHandling); } }
export class HandleErrorsTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.ErrorHandling); } }

const highPriority = new HighPriorityTaskFlag();
const mediumPriority = new MediumPriorityTaskFlag();
const lowPriority = new LowPriorityTaskFlag();

const onceOffNoOutput = new OnceOffNoOutputTaskFlag();
const onceOffWithOutput = new OnceOffWithOutputTaskFlag();
const repeatWithOutput = new RepeatWithOutputTaskFlag();
const repeatNoOutput = new RepeatNoOutputTaskFlag();

const ignoreErrors = new IgnoreErrorsTaskFlag();
const handleErrors = new HandleErrorsTaskFlag();
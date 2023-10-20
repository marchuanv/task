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
     * @returns { OnceOffNoDataResolveTaskFlag }
    */
    static get OnceOffNoDataResolve() {
        return onceOffNoDataResolve;
    }
    /**
     * @returns { OnceOffDataResolveTaskFlag }
    */
    static get OnceOffDataResolve() {
        return onceOffDataResolve;
    }
    /**
     * @returns { RepeatNoDataResolveTaskFlag }
    */
    static get RepeatNoDataResolve() {
        return repeatNoDataResolve;
    }
    /**
     * @returns { RepeatDataResolveTaskFlag }
    */
    static get RepeatDataResolve() {
        return repeatDataResolve;
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

export class OnceOffNoDataResolveTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Run); } }
export class OnceOffDataResolveTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Run); } }
export class RepeatNoDataResolveTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Run); } }
export class RepeatDataResolveTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.Run); } }

export class IgnoreErrorsTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.ErrorHandling); } }
export class HandleErrorsTaskFlag extends TaskFlag { constructor() { super(crypto.randomUUID(), TaskFlagGroup.ErrorHandling); } }

const highPriority = new HighPriorityTaskFlag();
const mediumPriority = new MediumPriorityTaskFlag();
const lowPriority = new LowPriorityTaskFlag();

const onceOffNoDataResolve = new OnceOffNoDataResolveTaskFlag();
const onceOffDataResolve = new OnceOffDataResolveTaskFlag();
const repeatNoDataResolve = new RepeatNoDataResolveTaskFlag();
const repeatDataResolve = new RepeatDataResolveTaskFlag();

const ignoreErrors = new IgnoreErrorsTaskFlag();
const handleErrors = new HandleErrorsTaskFlag();
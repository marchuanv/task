import crypto from 'node:crypto';
export class TaskFlagGroup {
    constructor(Id) {
        this.Id = Id;
    }
    /**
     * @returns { PriorityTaskFlagGroup }
    */
    static get Priority() {
        return priority;
    }
    /**
     * @returns { ErrorHandlingTaskFlagGroup }
    */
    static get ErrorHandling() {
        return errorHandling;
    }
    /**
     * @returns { ResponseTaskFlagGroup }
    */
    static get Response() {
        return response;
    }
    /**
     * @returns { RunTaskFlagGroup }
    */
     static get Run() {
        return run;
    }
}
export class PriorityTaskFlagGroup extends TaskFlagGroup { constructor(){ super(crypto.randomUUID()); }}
export class ErrorHandlingTaskFlagGroup extends TaskFlagGroup { constructor(){ super(crypto.randomUUID()); }}
export class ResponseTaskFlagGroup extends TaskFlagGroup { constructor(){ super(crypto.randomUUID()); }}
export class RunTaskFlagGroup extends TaskFlagGroup { constructor(){ super(crypto.randomUUID()); }}
const priority = new PriorityTaskFlagGroup();
const errorHandling = new ErrorHandlingTaskFlagGroup();
const response = new ResponseTaskFlagGroup();
const run = new RunTaskFlagGroup();


const privateBag = new WeakMap();
export class TaskProperties {
    constructor(callback) {
        callback(privateBag);
    }
}
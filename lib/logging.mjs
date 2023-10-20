const privateBag = new WeakMap();
const privateBagKeys = [];
process.on('exit', () => {
    let key = privateBagKeys.shift();
    while (key) {
        let messages = privateBag.get(key);
        messages = messages.sort((x, y) => {
            if (x.time > y.time) {
                return 1;
            }
            return -1;
        }).map(x => x.message);
        console.log('');
        console.log(`Context: ${key.Id}`);
        for (const message of messages) {
            console.log(` ${message}`);
        }
        key = privateBagKeys.shift();
    }
});
export class Logging {
    /**
     * @param { Object } context
     * @param { String } message
    */
    static log(context, message) {
        const logTime = process.hrtime.bigint();
        if (message instanceof Error) {
            message = message.message;
        }
        if (privateBag.has(context)) {
            const entries = privateBag.get(context);
            if (entries.find(e => e.message === message)) {
                message = `repeat ${message}`;
            }
            if (!entries.find(e => e.message === message)) {
                entries.push({ time: logTime, message });
            }
        } else {
            privateBag.set(context, [{ time: logTime, message }]);
            privateBagKeys.push(context);
        }
    }
}
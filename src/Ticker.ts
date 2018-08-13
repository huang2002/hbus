export type TickCallback = () => void;

export const defaultTickMethod = (callback: TickCallback) => {
    requestAnimationFrame(callback);
};

export const ticker = {

    tickMethod: defaultTickMethod,

    _willTick: false,
    _callbacks: new Array<TickCallback>(),

    tick(callback: TickCallback) {
        ticker._callbacks.push(callback);
        if (!ticker._willTick) {
            ticker._willTick = true;
            ticker.tickMethod(() => {
                ticker._willTick = false;
                const { _callbacks } = ticker;
                _callbacks.forEach(cb => {
                    cb();
                });
                _callbacks.length = 0;
            });
        }
    }

}

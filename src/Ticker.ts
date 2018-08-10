export const defaultTickMethod = (callback: () => void) => {
    requestAnimationFrame(callback);
};

export class Ticker {

    tickMethod = defaultTickMethod;

    private _willTick = false;
    private _callbacks = new Array<() => void>();

    tick(callback: () => void) {
        this._callbacks.push(callback);
        if (!this._willTick) {
            this._willTick = true;
            this.tickMethod(() => {
                this._willTick = false;
                const { _callbacks } = this;
                _callbacks.forEach(cb => {
                    cb();
                });
                _callbacks.length = 0;
            });
        }
    }

}

export const ticker = new Ticker();

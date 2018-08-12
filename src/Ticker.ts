export type TickCallback = () => void;

export const defaultTickMethod = (callback: TickCallback) => {
    requestAnimationFrame(callback);
};

export class Ticker {

    tickMethod = defaultTickMethod;

    private _willTick = false;
    private _callbacks = new Array<TickCallback>();

    tick(callback: TickCallback) {
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

import { Action } from "./Action";
import { Processor } from "./Processor";
import { ticker } from "./Ticker";
import { Comparer, defaultComparer } from "./Comparer";

export type Subscriber<S = any> = (state: S) => void;

export type StateRequestCallback<S = any> = (state: S) => void;

export class Bus<S = any, T = any, P = any> {

    constructor(
        public processor: Processor<S, Action<T, P>>,
        defaultState: S = {} as S
    ) {
        this._state = defaultState;
    }

    comparer: Comparer = defaultComparer;

    private _state: S;
    private _stateRequestCallbacks = new Array<StateRequestCallback<S>>();
    private _willUpdate = false;
    private _actions = new Array<Action<T, P>>();
    private _subscriberMap = new Map<keyof S, Subscriber[]>();
    private _subscribers = new Array<Subscriber<S>>();

    private _requestUdpate() {
        if (!this._willUpdate) {
            this._willUpdate = true;
            ticker.tick(() => {
                this._willUpdate = false;
                this._update();
                const { _stateRequestCallbacks, _state } = this;
                _stateRequestCallbacks.forEach(callback => {
                    callback(_state);
                });
                _stateRequestCallbacks.length = 0;
            });
        }
    }

    private _update() {
        const { processor, comparer, _state, _actions, _subscriberMap } = this,
            oldState = Object.assign({}, _state);
        let state = _state,
            t;
        _actions.forEach(action => {
            t = processor(state, action);
            if (t !== undefined) {
                state = t;
            }
        });
        _actions.length = 0;
        this._state = state;
        let hasChanged = false;
        _subscriberMap.forEach((subscribers, propName) => {
            const prop = state[propName];
            if (!comparer(prop, oldState[propName])) {
                hasChanged = true;
                subscribers.forEach(subscriber => {
                    subscriber(prop);
                });
            }
        });
        if (hasChanged || !comparer(oldState, state)) {
            this._subscribers.forEach(subscriber => {
                subscriber(state);
            });
        }
    }

    getState() {
        return this._state;
    }

    requestState(callback: StateRequestCallback<S>) {
        this._stateRequestCallbacks.push(callback);
        this._requestUdpate();
        return this;
    }

    publish(action: Action<T, P>) {
        this._actions.push(action);
        this._requestUdpate();
        return this;
    }

    subscribe(subscriber: Subscriber<S>) {
        this._subscribers.push(subscriber);
        return this;
    }

    unsubscribe(subscriber: Subscriber<S>) {
        const { _subscribers } = this,
            index = _subscribers.indexOf(subscriber);
        if (index >= 0) {
            _subscribers.splice(index, 1);
        }
        return this;
    }

    clearSubscribers() {
        this._subscribers.length = 0;
        return this;
    }

    subscribeProp<P extends keyof S>(propName: P, subscriber: Subscriber<S[P]>) {
        const { _subscriberMap } = this;
        let subscribers = _subscriberMap.get(propName);
        if (!subscribers) {
            _subscriberMap.set(propName, subscribers = []);
        }
        subscribers.push(subscriber);
        return this;
    }

    unsubscribeProp<P extends keyof S>(propName: P, subscriber: Subscriber<S[P]>) {
        const { _subscriberMap } = this,
            subscribers = _subscriberMap.get(propName);
        if (subscribers) {
            const index = subscribers.indexOf(subscriber);
            if (index >= 0) {
                subscribers.splice(index, 1);
            }
        }
        return this;
    }

    clearPropSubscribers(propName: keyof S) {
        this._subscriberMap.delete(propName);
        return this;
    }

    clearAllPropSubscribers() {
        this._subscriberMap.clear();
        return this;
    }

    clearAllSubscribers() {
        return this.clearSubscribers().clearAllPropSubscribers();
    }

}


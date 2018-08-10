import { Action } from "./Action";
import { Processor } from "./Processor";
import { ticker } from "./Ticker";
import { Comparer, defaultComparer } from "./Comparer";

export type Subscriber<S = any> = (states: S) => void;

export type StatesRequestCallback<S = any> = (states: S) => void;

export class Bus<S = any, T = any, A extends Action<T> = Action<T>> {

    constructor(
        public processor: Processor<S, A>,
        defaultStates?: S
    ) {
        this._states = defaultStates || ({} as S);
    }

    comparer: Comparer = defaultComparer;

    private _states: S;
    private _statesRequestCallbacks = new Array<StatesRequestCallback<S>>();
    private _willUpdate = false;
    private _actions = new Array<A>();
    private _subscriberMap = new Map<keyof S, Subscriber[]>();
    private _subscribers = new Array<Subscriber<S>>();

    private _requestUdpate() {
        if (!this._willUpdate) {
            this._willUpdate = true;
            ticker.tick(() => {
                this._willUpdate = false;
                this._update();
                const { _statesRequestCallbacks, _states } = this;
                _statesRequestCallbacks.forEach(callback => {
                    callback(_states);
                });
                _statesRequestCallbacks.length = 0;
            });
        }
    }

    private _update() {
        const { processor, comparer, _states, _actions, _subscriberMap } = this,
            oldStates = Object.assign({}, _states),
            states = this._states = _actions.reduce(
                (states, action) => Object.assign(states, processor(states, action)),
                _states
            );
        let hasChanged = false;
        _subscriberMap.forEach((subscribers, propName) => {
            const prop = states[propName];
            if (!comparer(prop, oldStates[propName])) {
                hasChanged = true;
                subscribers.forEach(subscriber => {
                    subscriber(prop);
                });
            }
        });
        if (hasChanged || !comparer(oldStates, states)) {
            this._subscribers.forEach(subscriber => {
                subscriber(states);
            });
        }
        _actions.length = 0;
    }

    getStates() {
        return this._states;
    }

    requestStates(callback: StatesRequestCallback<S>) {
        this._statesRequestCallbacks.push(callback);
        this._requestUdpate();
        return this;
    }

    publish(action: A) {
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


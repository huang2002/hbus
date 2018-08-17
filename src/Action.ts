export class Action<T = any, P = any> {
    constructor(
        public readonly type: T,
        public readonly payload?: Readonly<P>
    ) { }
}

export type ActionFactory<T = any, P = any> = (payload?: P) => Action<T, P>;

export function createActionFactory<T, P = any, DP extends (P extends object ? Partial<P> : P) = (P extends object ? Partial<P> : P)>(
    type: T, defaultPayload?: DP
): ActionFactory<T, P> {
    const defaultPayloadIsObject = defaultPayload instanceof Object;
    return (payload?: P) => new Action(
        type,
        defaultPayloadIsObject && payload instanceof Object ?
            Object.assign({}, defaultPayload, payload) :
            payload
    );
}

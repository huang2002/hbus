export class Action<T = any, P = any> {
    constructor(
        public readonly type: T,
        public readonly payload?: Readonly<P>
    ) { }
}

export type ActionFactory<T, P = any> = (payload?: P) => Action<T, P>;

export function createActionFactory<T, P = any, DP extends Partial<P> = Partial<P>>(
    type: T, defaultPayload?: DP
): ActionFactory<T, P> {
    return (payload?: P) => ({ type, payload: Object.assign({}, defaultPayload, payload) });
}

import { Action } from "./Action";

export type Processor<S = any, A = Action> = (oldState: S, action: A) => Partial<S>;

export interface ProcessorMap<S = any, A extends Action = Action> {
    [type: string]: Processor<S, A>;
}

export function createProcessor<S = any, A extends Action = Action>(
    processorMap: ProcessorMap<S, A>,
    defaultProcessor?: Processor<S, A>
): Processor<S, A> {
    return (state, action) => {
        const { type } = action;
        return (type in processorMap) ? processorMap[type](state, action) :
            defaultProcessor ? defaultProcessor(state, action) : state;
    };
}

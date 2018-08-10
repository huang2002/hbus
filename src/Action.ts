export interface ActionData {
    [data: string]: any;
}

export type Action<T = any, D extends ActionData = ActionData> = D & { type: T };

export type ActionFactory<T, D = any> = (data?: D) => Action<T, D>;

export function createActionFactory<T, D = any, DD extends Partial<D> = Partial<D>>(type: T, defaultData?: DD): ActionFactory<T, D> {
    return (data?: D) => Object.assign({ type }, defaultData, data);
}

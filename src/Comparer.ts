
export type Comparer = (oldState: any, newState: any) => boolean;

export const defaultComparer: Comparer = (oldState, newState) => {

    if (
        oldState === newState && String(oldState) === String(newState) ||
        oldState !== oldState && newState !== newState
    ) {
        return true;
    } else {

        if (!(oldState instanceof Object && newState instanceof Object)) {
            return false;
        }

        for (const oldKey in oldState) {
            if (!(oldKey in newState && defaultComparer(oldState[oldKey], newState[oldKey]))) {
                return false;
            }
        }

        for (const newKey in newState) {
            if (!(newKey in oldState)) {
                return false;
            }
        }

        return true;

    }

};

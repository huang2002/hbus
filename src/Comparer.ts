
export type Comparer = (oldStates: any, newStates: any) => boolean;

export const defaultComparer: Comparer = (oldStates, newStates) => {

    if (
        oldStates === newStates && String(oldStates) === String(newStates) ||
        oldStates !== oldStates && newStates !== newStates
    ) {
        return true;
    } else {

        if (!(oldStates instanceof Object && newStates instanceof Object)) {
            return false;
        }

        for (const oldKey in oldStates) {
            if (!(oldKey in newStates && defaultComparer(oldStates[oldKey], newStates[oldKey]))) {
                return false;
            }
        }

        for (const newKey in newStates) {
            if (!(newKey in oldStates)) {
                return false;
            }
        }

        return true;

    }

};

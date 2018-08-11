"use strict";
// @ts-check
/// <reference types="../" />

let log;
if (typeof document !== 'undefined') {
    const output = document.getElementById('output');
    log = (...msgs) => {
        msgs.forEach((msg, i) => {
            output.innerHTML += typeof msg === 'object' ? JSON.stringify(msg) : msg;
            if (i > 0) {
                output.innerHTML += ' ';
            }
        });
        output.innerHTML += '\n';
    }
} else {
    log = console.log;
    global.requestAnimationFrame = setTimeout;
    global.HBus = require('../dist/hbus.umd.js');
}

const bus = new HBus.Bus(
    HBus.createProcessor({
        A: (state, { by = 1 }) => ({ a: state.a + by }),
        B: (state, { by }) => ({ b: state.b + by })
    }, (state, action) => {
        log('Unknown action:', action);
        return state;
    }), {
        a: 0,
        b: 0
    }
);

const A = HBus.createActionFactory('A');

bus.subscribe(action => {
    log('Action:', action);
}).subscribeType('A', action => {
    log('Action on A:', action);
}).subscribeType('B', () => {
    log('This subscriber should be removed!');
}).clearSubscribersOfType('B');

log('Publish action on A.');
bus.publish(A());

log('Publish action on B.');
bus.publish({
    type: 'B',
    by: 2
});

log('Publish action on C.');
bus.publish({
    type: 'C'
});

log('Current state:', bus.getState());
bus.requestState(state => {
    log('Current state', state);
});

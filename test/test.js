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
        A: (state, { payload: { by = 1 } }) => { state.a += by },
        B: (state, { payload: { by } }) => { state.b += by }
    }, (state, action) => {
        log('Unknown action: ', action);
        return state;
    }), {
        a: 0,
        b: 0
    }
);

const A = HBus.createActionFactory('A');

bus.subscribe(state => {
    log('state: ', state);
}).subscribeProp('a', a => {
    log('state.a: ', a);
}).subscribeProp('b', () => {
    log('This subscriber should be removed!');
}).clearPropSubscribers('b');

log('Publish action A.');
bus.publish(A());

log('Publish action B.');
bus.publish({ type: 'B', payload: { by: 2 } });

log('Publish action C.');
bus.publish(new HBus.Action('C'));

const state0 = bus.getState();
log('Current state:', state0);
bus.requestState(state => {
    log('Current state: ', state);
});

log('------');

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
        A: (states, { by = 1 }) => ({ a: states.a + by }),
        B: (states, { by }) => ({ b: states.b + by })
    }, (states, action) => {
        log('Unknown action:', action);
        return states;
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

log('Current states:', bus.getStates());
bus.requestStates(states => {
    log('Current states', states);
});

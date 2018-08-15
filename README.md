# HBus

An event bus lib.

This lib helps you deal with the state of your application. Define an action processor, then publish actions anywhere and subscribe to the changes of state or even specified properties.

# Example

```js
// Use as an es module:
import { Bus } from "hbus";
// or a umd module:
const { Bus } = HBus;
// Define a processor:
function processor(state, action) {
    // ...
}
// Initialize state:
const defaultState = { foo: 'bar' };
// Create a bus:
const bus = new Bus(processor, defaultState);
// Subscribe to changes:
bus.subscribe(state => {
    // ...
}).subscribeProp('foo', prop => {
    // ...
});
// Publish an action:
bus.publish(
    new HBus.Action(
        'SOME_ACTION_TYPE',
        {
            // Custom payload... 
        }
    )
);
```

# Usage

Install via npm:

```shell
npm i hbus
```

Load from [unpkg.com](https://unpkg.com/):

```html
<script crossorigin="anonymous" src="https://unpkg.com/hbus"></script>
```

# APIs

## Action

```ts
new HBus.Action(type, payload?);
```

A `type` is required for an `action` and custom data can be stored as `payload`.

An `action` object is just like this:

```js
{
    type: 'SOME_ACTION_TYPE',
    payload: {
        foo: 'bar'
    }
}
```

So, you can also use a javascript object as an `action`, e.g. `{ type: 'FOO', payload: 'bar' }`.

## Bus

```ts
new HBus.Bus(processor, defaultState?);
```

This is the bus constructor. You need to pass an action processor to it and you can pass the default state.

### processor

```ts
bus.processor(state, action): void | State;
```

The `processor` handles the actions and updates the `state`.

For instance:

```js
function processor(state, action) {
    switch (action.type) {
        case 'INC_A':
            // You can change the properties
            // on the `state` directly: 
            // (In fact, it is a shallow
            // copy. So, `state.a++` works
            // correctly, but `state.b.c++`
            // doesn't because it will
            // change the original state
            // and leads to a bug.)
            state.a++;
            break;
        case 'INC_B':
            // If you want to change deep
            // properties or replace the
            // `state`, just return a new
            // `state` like this: (Do
            // not forget to copy other
            // properties if there're any.)
            return {
                // ...state,
                b: {
                    // ...state.b,
                    c: state.b.c + 1
                }
            };
        default:
            // ...
            break;
    }
}
```

### comparer

```ts
bus.comparer(oldState, newState): boolean;
```

The `comparer` compares the two states and tells whether they are the same. If it returns true than `bus` will think that there's no changes and no subscribers will be called. By default, it is set to `HBus.defaultComparer` which returns whether the two state are deeply equal(e.g. `{ a: { b: NaN } }` equals `{ a: { b: NaN } }`, but it doesn't equal `{ a: { b: NaN, c: undefined } }`). You can set a custom one if needed.

### getState

```ts
bus.getState(): State;
```

This method returns the current state. Please note that the state are updated **asynchronously**, so use [`requestState`](#requeststate) if you need the state that may be changed next tick.

### requestState

```ts
bus.requestState(callback): this;
```

The `callback` will be called next tick and receive newer state. To improve the performance, actions are processed asynchronously. So:

```js
// An action is published here:
bus.publish({ type: 'FOO_BAR' });
// This doesn't work correctly because
// the action hasn't been processed
// and state hasn't been updated:
console.log(bus.getState());
// This will work correctly because
// the callback will be called at
// the right time:
bus.requestState(newerState => {
    console.log(newerState);
});
```

### publish

```ts
bus.publish(action): this;
```

Call this method to publish an action.

### subscribe

```ts
bus.subscribe(subscriber): this;
```

You can call this method to subscribe to all changes on the state.

### unsubscribe

```ts
bus.unsubscribe(subscriber): this;
```

You can call this method to remove a subscriber.

### clearSubscribers

```ts
bus.clearSubscribers(): this;
```

This method clears the subscribers registed by [`subscribe`](#subscribe).

### subscribeProp

```ts
bus.subscribeProp(propName, subscriber): this;
```

You can use this to subscribe to changes on a property of the state. The `subscriber` will only receive the specified property instead of the entire state.

### unsubscribeProp

```ts
bus.unsubscribeProp(propName, subscriber): this;
```

Call this to remove a property subscriber.

### clearPropSubscribers

```ts
bus.clearPropSubscribers(propName): this;
```

This method clears all the subscribers to a specified property.

### clearAllPropSubscribers

```ts
bus.clearAllPropSubscribers(): this;
```

This method clears all the property subscribers.

### clearAllSubscribers

```ts
bus.clearAllSubscribers(): this;
```

Call this method to clear all the subscribers.

## createActionFactory

```ts
HBus.createActionFactory(type, defaultPayload?): ActionFactory;
```

This method returns an action factory which receives some data as payload and returns an action of a specified type. You can also pass the default payload to it.

```js
// Create an action factory for action A:
const actionA = HBus.createActionFactory('A', {
    foo: 'foo',
    hello: 'world'
});
// Use it like this:
bus.publish(actionA({ foo: 'bar' }));
// (equals) bus.publish({ type: 'A', payload: { foo: 'bar', hello: 'world' } });
```

## createProcessor

```ts
HBus.createProcessor(processorMap, defaultProcessor?): Processor;
```

This is a utility method that helps you create a processor. You need to pass an object to it. Each pair of the object stands for an action type and a processor for it. You can also pass a default processor which handles the actions whose types are not in `processorMap`.

For example:

```js
const combinedProcessor = HBus.createProcessor({
    foo(state, action) {
        // Do sth. to `state` or return a new one.
    },
    bar(state, action) {
        // Do sth. to `state` or return a new one.
    }
}, (state, action) => {
    // Do sth. to `state` or return a new one.
});
// The above is similar to the following:
const combinedProcessor = (state, action) => {
    switch (action.type) {
        case 'foo':
            // Do sth. to `state` or return a new one.
            break;
        case 'bar':
            // Do sth. to `state` or return a new one.
            break;
        default:
            // Do sth. to `state` or return a new one.
            break;
    }
};
```

## ticker

```js
HBus.ticker
```

The `ticker` receives update requests from buses internally and handles them every tick.

### tickMethod

```ts
HBus.ticker.tickMethod(callback): void;
```

This method handles the `callback` and is used internally. By default, it is set to `HBus.defaultTickMethod` which directly pass the `callback` to `requestAnimationFrame`. You can set your custom one if needed.

# Changelog

See [CHANGELOG.md](CHANGELOG.md)

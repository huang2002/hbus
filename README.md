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
    return changedProps;
}
// Create a bus:
const bus = new Bus(processor);
// Subscribe to any changes on state:
bus.subscribe(state => {
    // ...
}).subscribeProp('someProp', prop => {
    // ...
});
// Publish an action:
bus.publish({
    type: 'SOME_ACTION_TYPE',
    // Custom data...
});
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

An `action` is just an object(, so please note that there's **no** `HBus.Action`.). Only a `type` property is required for each action, and any other custom properties are up to you.

```js
// This is an valid action:
{
    type: 'LOGIN',
    name: 'foo',
    password: 'bar'
}
```

## Bus

```ts
new HBus.Bus(processor, defaultState?);
```

This is the bus constructor. You need to pass an action processor to it and you can pass the default state.

### processor

```js
bus.processor(state, action);
```

The `processor` handles the actions and tells what changes.

For instance:

```js
function processor(state, action) {
    if (action.type === 'INC_A') {
        // You only need to return what changes:
        return { a: state.a + 1 };
    } else {
        return {}; // (no change)
    }
}
```

### comparer

```js
bus.comparer(oldState, newState);
```

The `comparer` compares the two states and tells whether they are the same. If it returns true than `bus` will think that there's no changes and no subscribers will be called. By default, it is set to `HBus.defaultComparer` which returns whether the two state are deeply equal(e.g. `{ a: { b: NaN } }` equals `{ a: { b: NaN } }`, but it doesn't equal `{ a: { b: NaN, c: undefined } }`). You can set a custom one if needed.

### getState

```js
bus.getState();
```

This method returns the current state. Please note that the state are updated **asynchronously**, so use [`requestState`](#requeststate) if you need the state that may be changed next tick.

### requestState

```js
bus.requestState(callback);
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

```js
bus.publish(action);
```

Call this method to publish an action.

### subscribe

```js
bus.subscribe(subscriber);
```

You can call this method to subscribe to all changes on the state.

### unsubscribe

```js
bus.unsubscribe(subscriber);
```

You can call this method to remove a subscriber.

### clearSubscribers

```js
bus.clearSubscribers();
```

This method clears the subscribers registed by [`subscribe`](#subscribe).

### subscribeProp

```js
bus.subscribeProp(propName, subscriber);
```

You can use this to subscribe to changes on a property of the state. The `subscriber` will only receive the specified property instead of the whole state.

### unsubscribeProp

```js
bus.unsubscribeProp(propName, subscriber);
```

Call this to remove a property subscriber.

### clearPropSubscribers

```js
bus.clearPropSubscribers(propName);
```

This method clears all the subscribers to a specified property.

### clearAllPropSubscribers

```js
bus.clearAllPropSubscribers();
```

This method clears all the property subscribers.

### clearAllSubscribers

```js
bus.clearAllSubscribers();
```

Call this method to clear all the subscribers.

## createActionFactory

```ts
HBus.createActionFactory(type, defaultData?);
```

This method returns an action factory which receives some data and returns an action of a specified type. You can also pass some default data to it.

```js
// Create an action factory for action A:
const actionA = HBus.createActionFactory('A', {
    foo: 'foo',
    hello: 'world'
});
// Use it like this:
bus.publish(actionA({ foo: 'bar' }));
// (equals) bus.publish({ type: 'A', foo: 'bar', hello: 'world' });
```

## createProcessor

```ts
HBus.createProcessor(processorMap, defaultProcessor?);
```

This is a utility method that helps you create a processor. You need to pass an object to it. Each pair of the object stands for an action type and a processor for it. You can also pass a default processor which handles the actions whose types are not in `processorMap`.

For example:

```js
const combinedProcessor = HBus.createProcessor({
    foo(state, action) {
        // Return sth. according to foo action...
    },
    bar(state, action) {
        // Return sth. according to bar action...
    }
}, (state, action) => {
    // Return sth. according to other actions...
});
// The above is similar to the following:
const combinedProcessor = (state, action) => {
    switch (action.type) {
        case 'foo':
            // Return sth. according to foo action...
        case 'bar':
            // Return sth. according to bar action...
        default:
            // Return sth. according to other actions...
    }
};
```

## ticker

```js
HBus.ticker
```

The `ticker` receives update requests from buses internally and handles them every tick.

### tickMethod

```js
HBus.ticker.tickMethod(callback);
```

This method handles the `callback` and is used internally. By default, it is set to `HBus.defaultTickMethod` which directly pass the `callback` to `requestAnimationFrame`. You can set your custom one if needed.

# Changelog

See [CHANGELOG.md](CHANGELOG.md)

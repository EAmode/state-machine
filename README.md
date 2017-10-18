# ea-state-machine
[![NPM version](https://img.shields.io/npm/v/ea-state-machine.svg)](https://www.npmjs.org/package/ea-state-machine)
[![Travis](https://img.shields.io/travis/eascientific/ea-state-machine/master.svg)](https://travis-ci.org/eascientific/ea-state-machine)

A a reactive modern JavaScript library for general purpose finite state machines with support for navigation and routing.

<p align="center">
  <img src="./doc/statemachine-matter.svg" width="450px">
</p>

## Overview

This `state machine` library can be used to track the states and model state transitions of 
  - business objects,
  - application status,
  - proccess flows,
  - and many more.

Using finite state machine models helps to structure and reason about problems. It supports creating maintainable business rules and source code.
Use the state machine diagrams to communicate behaviour and requirements.

Examples:
  - *Task Management*: Once a task is `pending`, it can be `assigned`, `completed`, or `canceled`. An email is send out to the assinged person.
  - *Flight status*: A plane is `IN` the gate and then is pushed `OUT`. Once `ON` the runway, the plane takes `OFF` from the origin airport to land `ON` at the destination.

## Usage

Using node/webpack/rollup/browserify:
```shell
  npm install ea-state-machine
```
```javascript
import { FSM } from 'ea-state-machine'
```
Defining set of possible [States](/doc/states.md).
```javascript
const state = {
  solid: { 
    name: 'Ice'
  },
  liquid: { 
    name: 'Water'
  },
  gas: { 
    name: 'Vapor'
  }
}
```
[Guards](/doc/guards.md) prevent transitions by returning false
```javascript
const guard = {
  canMelt: (fsm, from, to) => fsm.data.temperature > 0,
  canVaporize: (fsm, from, to) => fsm.data.temperature > 100,
  canCondense: (fsm, from, to) => fsm.data.temperature < 100,
  canFreeze: (fsm, from, to) => fsm.data.temperature >= 0
}
```
[Transition Definitions](/doc/transition-definitions.md) can be from many to many
```javascript
const transitionDefiniton = {
    melt: {
      from: () => [state.solid],
      to: () => [state.liquid],
      guards: [guard.canMelt],
      action: () => console.log('melting ...'),
    },
    vaporize: {
      from: () => [state.liquid],
      to: () => [state.gas],
      action: () => console.log('vaporizing ...'),
      guards: [guard.canVaporize],
    },
    condense: {
      from: () => [state.gas],
      to: () => [state.liquid],
      guards: [guard.canCondense],
      action: () => console.log('condenseing ...'),
    },
    freeze: {
      from: () => [state.liquid],
      to: () => [state.solid],
      guards: [guard.canFreeze],
      action: () => console.log('freezing ...'),
    },
  }
```
Using the above state machine.
```js
// data associated with the fsm
const environment = { 
  temperature: 0 
}

const fsm = new FSM(
  state, // all states
  transitionDefiniton, // transition defitions between states
  state.solid, // optional: start state, if omitted, a transition to the first state needs to happen
  environment // optional: associated data with the state machine
)

fsm.currentState === fsm.states.solid // true

// Can we melt?
fsm.canTranstionTo(fsm.statesliquid) // false
// Heat and update FSM 
fsm.changeData({ environment.temperature = 4})
fsm.canTranstionTo(fsm.states.liquid) // true
fs.transtionTo(fsm.states.liquid)
// // different ways with same effect as above
// fsm.transitionByDefinition(transitionDefiniton.melt)
// fsm.transition(fsm.transitions.filter(t => t.to === fsm.states.liquid))
fsm.currentState.name === 'Water' // true
```

## Documentation

 - [Design](doc/documentation#design)
 - [States](doc/documentation#states)
 - [Transition Definitions](doc/documentation#transitions)
 - [Guards](doc/documentation#design)
 - [API] (http://ea-state-machine.eascientific.com/)

## Examples
TODO: One page per example


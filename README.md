# ea-state-machine
[![NPM version](https://img.shields.io/npm/v/ea-state-machine.svg)](https://www.npmjs.org/package/ea-state-machine)
[![Travis](https://img.shields.io/travis/eascientific/ea-state-machine/master.svg)](https://travis-ci.org/eascientific/ea-state-machine)

A library for general purpose finite state machines with support for navigation and routing.

<center>
  <img src="./doc/statemachine-matter.svg" width="450px">
</center>

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

Using npm:
```shell
  npm install --save-dev javascript-state-machine
```
```js
import { FSM } from 'ea-state-machine'

// defining set of possible states
const state = {
  solid: { name: 'Ice'},
  liquid: { name: 'Water'},
  gas: { name: 'Vapor'}
}
// guards prevent transitions by returning false
const guard = {
  canMelt: (fsm, from, to) => fsm.data.temperature > 0,
  canVaporize: (fsm, from, to) => fsm.data.temperature > 100,
  canCondense: (fsm, from, to) => fsm.data.temperature < 100,
  canFreeze: (fsm, from, to) => fsm.data.temperature >= 0
}
// transition definitions can be FROM one or multiple states TO one or many
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
// data associated with the fsm
const environment = { temperature: 0 }
const fsm = new FSM(
  state, // all states
  transitionDefiniton, // transition defiitions between states
  state.solid, // optional: start state, if omitted, a transition to the first state needs to happen
  environment // associated data with the state machine
)
```
... getting the current state

`fsm.currentState` // ice: Object `state.solid`

... can we melt?

`fsm.canTranstionTo(fsm.statesliquid)` // `false`

... heating the environment
```js
fsm.changeData({ environment.temperature = 4}) // heat and notify FSM 
const isPossible = fsm.canTranstionTo(fsm.statesliquid) // true
fsm.transitionByDefinition(transitionDefiniton.melt)
fsm.currentState // state.liquid (water)
```

## Documentation


TODO: focus on up side and move this to documentation, create a doc folder, 
one doc page (does anchor linking work?)
 - Design
 - States
 - Transitions
 - Guards
 - API? (how to link to doc generated)
 - List examples
One page per example


import { FSM } from "../src/ea-state-machine"

const state = {
  solid: {},
  liquid: {},
  gas: {},
}

const transitionDefiniton = {
  initialize: {
    from: () => [state.solid],
    to: () => [state.liquid],
    action: () => console.log('starting the statemachine'),
  }
}

describe("FSM with start state", () => {
  it("FSM can be instantiated with start state", () => {
    const fsm = new FSM(state, transitionDefiniton, state.solid)
    expect(fsm).toBeInstanceOf(FSM)
  })
  it("After instantiation, FSM should be in start state", () => {
    const fsm = new FSM(state, transitionDefiniton, state.solid)
    expect(fsm.currentState).toEqual(state.solid)
  })
})

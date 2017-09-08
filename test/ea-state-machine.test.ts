import { FSM } from "../src/ea-state-machine"

const state = {
  solid: {},
  liquid: {},
  gas: {},
}

const transitionDefiniton={
  initialize: {
    from: () => [state.solid],
    to: () => [state.liquid],
    action: () => console.log('starting the statemachine'),
  }
}

describe("Dummy test", () => {
  it("works if true is truthy", () => {
    expect(true).toBeTruthy()
  })

  it("DummyClass is instantiable", () => {
    const fsm = new FSM()
    expect(fsm).toBeInstanceOf(FSM)
    fsm.print("test")
  })
})

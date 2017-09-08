import DummyClass, { FSM } from "../src/ea-state-machine"

/**
 * Dummy test
 */
describe("Dummy test", () => {
  it("works if true is truthy", () => {
    expect(true).toBeTruthy()
  })

  it("DummyClass is instantiable", () => {
    expect(new DummyClass()).toBeInstanceOf(DummyClass)
    const fsm = new FSM()
    expect(fsm).toBeInstanceOf(FSM)
    fsm.print("test")
  })
})

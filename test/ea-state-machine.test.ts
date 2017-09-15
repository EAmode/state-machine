import { FSM } from '../src/ea-state-machine'

const h2oStateMachine = () => {
  const state = {
    solid: {
      name: 'Ice',
      count: 1,
      order: 1,
      valid: true,
      changed: true
    },
    liquid: {
      name: 'Water'
    },
    gas: {
      name: 'Vapor'
    },
  }

  const transitionDefiniton = {
    melt: {
      from: () => [state.solid],
      to: () => [state.liquid],
      action: () => console.log('starting the statemachine'),
    },
    vaporize: {
      from: () => [state.liquid],
      to: () => [state.gas],
      action: () => console.log('starting the statemachine'),
    }
  }

  return Object.freeze({ state, transitionDefiniton })
}

describe('FSM WITH start state', () => {
  const { state, transitionDefiniton } = h2oStateMachine()
  const fsm = new FSM(state, transitionDefiniton, state.solid)
  it('FSM can be instantiated with start state', () => {
    expect(fsm).toBeInstanceOf(FSM)
  })
  it('After instantiation, FSM should be in start state', () => {
    expect(fsm.currentState).toEqual(state.solid)
  })
  it('Current State should be valid', () => {
    expect(fsm.currentState.valid).toBeTruthy()
  })
  it('Current State valid attr is the same as FSM.valid', () => {
    expect(fsm.currentState.valid).toEqual(fsm.valid)
  })
  it('Current State valid attr is the same as FSM.valid', () => {
    expect(fsm.currentState.valid).toEqual(fsm.valid)
  })
  it('Current State should have same initial values', () => {
    expect(fsm.currentState).toMatchObject({ name: 'Ice', order: 1, valid: true, changed: true })
  })
  it('Current State count should be increased by one', () => {
    expect(fsm.currentState.count).toEqual(2)
  })
  it('Can transition to liquid', () => {
    expect(fsm.canTransitionTo(state.liquid)).toBeTruthy()
  })
  it('Transitioning to liquid by definition', () => {
    fsm.transitionByDefinition(transitionDefiniton.melt)
    expect(fsm.currentState).toEqual(state.liquid)
    expect(fsm.currentState.count).toEqual(1)
  })
  it('Transitioning to gas by selecting first possible transtion to gas state', () => {
    fsm.transitionTo(state.gas)
    expect(fsm.currentState).toEqual(state.gas)
    expect(fsm.currentState.count).toEqual(1)
  })
  it('Transitioning back to water with vaporizing should fail', () => {
    expect(() => fsm.transitionByDefinition(transitionDefiniton.vaporize)).toThrow()
  })

})

describe('FSM WITHOUT start state', () => {
  it('FSM can be instantiated without start state', () => {
    const { state, transitionDefiniton } = h2oStateMachine()
    const fsm = new FSM(state, transitionDefiniton)
    expect(fsm).toBeInstanceOf(FSM)
  })
  it('After instantiation, current state should a default start state', () => {
    const { state, transitionDefiniton } = h2oStateMachine()
    const fsm = new FSM(state, transitionDefiniton)
    expect(fsm.currentState).toEqual({ changed: false, count: 1, order: 0, startState: true, valid: false })
  })
})

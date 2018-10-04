import { FSM } from '../src/ea-state-machine'
import { TransitionDefinitionMap } from '../src/types'

const h2oStateMachine = () => {
  const state = {
    solid: {
      name: 'Ice',
      count: 1,
      order: 1,
      valid: true,
      changed: true,
      // tslint:disable-next-line:no-console
      onEnter: () => {
        console.log('Entering Ice State!')
      },
      onExit: () => {
        console.log('Leaving Ice State!')
      },
    },
    liquid: {
      name: 'Water',
    },
    gas: {
      name: 'Vapor',
    },
  }

  const guard = {
    canMelt: fsm => fsm.data.temperature > 0,
    canVaporize: fsm => fsm.data.temperature > 100,
    canCondense: fsm => fsm.data.temperature < 100,
    canFreeze: fsm => fsm.data.temperature >= 0,
  }

  const transitionDefiniton: TransitionDefinitionMap = {
    melt: {
      from: state.solid,
      to: [state.liquid],
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

  return Object.freeze({ state, transitionDefiniton })
}

describe('FSM WITH start state', () => {
  const { state, transitionDefiniton } = h2oStateMachine()
  const environment = { temperature: 0 }
  const fsm = new FSM(state, transitionDefiniton, state.solid, environment)
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
  it('Cannot transition to liquid (blocked by guard)', () => {
    expect(fsm.canTransitionTo(state.liquid)).toEqual(false)
  })
  it('Can transition to liquid', () => {
    environment.temperature = 4
    fsm.changeData(environment)
    expect(fsm.canTransitionTo(state.liquid)).toEqual(true)
  })
  it('Transitioning to liquid by definition', () => {
    fsm.transitionByDefinition(transitionDefiniton.melt)
    expect(fsm.currentState).toEqual(state.liquid)
    expect(fsm.currentState.count).toEqual(1)
  })
  it('Transitioning to gas by selecting first possible transtion to gas state', () => {
    environment.temperature = 101
    fsm.changeData(environment)
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
    expect(fsm.currentState).toEqual({
      changed: false,
      count: 1,
      order: 0,
      startState: true,
      valid: false,
    })
  })
})

import { FSM } from '../src/index'
import { State, StateMap, TransitionDefinitionMap } from '../src/types'

const stepStateMachine = () => {
  const startState: State = {
    name: 'Start State',
    path: '',
    component: { name: 'Start Component' },
    onEnter: (fsm) => {
      console.log(fsm.currentState.name + ' entered')
    },
  }

  const state: StateMap = {
    application: {
      name: 'Application View',
      path: 'application/:id',
      component: { name: 'Application View Component' },
      onEnter: (fsm) => {
        console.log(fsm.currentState.name + ' entered')
      },
      onExit: (fsm) => {
        console.log(fsm.currentState.name + ' exited')
      },
    },
    entity: {
      name: 'Entity View',
      path: 'entity/:id',
      component: { name: 'Entity View Component' },
      onEnter: (fsm) => {
        console.log(fsm.currentState.name + ' entered')
      },
      onExit: (fsm) => {
        console.log(fsm.currentState.name + ' exited')
      },
    },
    document: {
      name: 'Document View',
      path: 'document/:id',
      component: { name: 'Entity View Component' },
      onEnter: (fsm) => {
        console.log(fsm.currentState.name + ' entered')
      },
      onExit: (fsm) => {
        console.log(fsm.currentState.name + ' exited')
      },
    },
  }

  const anyState: State[] = Object.values(state)

  const transitionDefinition: TransitionDefinitionMap = {
    initialize: {
      from: () => startState,
      to: () => anyState,
      action: () => console.log('starting the statemachine'),
    },
    any: {
      from: anyState,
      to: anyState,
      action: () => console.log('any transition'),
    },
  }

  return Object.freeze({ startState, state, transitionDefinition })
}

describe('Website', () => {
  const { startState, state, transitionDefinition } = stepStateMachine()
  const fsm = new FSM(state, transitionDefinition, startState)

  test('initializes FSM and moves into start state', () => {
    fsm.initialize({ name: 'website name' })
    expect(fsm.currentState).toEqual(startState)
    expect(fsm.data.name).toEqual('website name')
    expect(fsm.currentState.count).toEqual(1)
  })

  test('transition$ emits transitions', (done) => {
    expect(fsm.currentState).toEqual(startState)
    fsm.transition$.subscribe((t) => {
      expect(t).toBeTruthy()
      if (t.transitionDefinition === transitionDefinition.initialize) {
        expect(t.toState).toBe(state.application)
      }
      done()
    })
    fsm.transitionTo(state.application)
  })
})

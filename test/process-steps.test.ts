import { FSM } from '../src/ea-state-machine'



const stepStateMachine = () => {
  const state = {
    step1: {
      name: 'Step 1',
      order: 1,
      onEnter: () => { console.log('Entering Step 1!') },
      onExit: () => { console.log('Leaving Step 1!') }
    },
    step2: {
      name: 'Step 2',
      order: 2,
      onEnter: () => { console.log('Entering Step 2!') },
      onExit: () => { console.log('Leaving Step 2!') }
    },
    step3: {
      name: 'Step 3',
      order: 3,
      onEnter: () => { console.log('Entering Step 3!') },
      onExit: () => { console.log('Leaving Step 3!') }
    },
  }

  const guard = {
    leaveIfValid: (fsm, from, to) => !!from.valid
  }

  const transitionDefiniton = {
    continueToNextStep: {
      from: () => [state.step1],
      to: () => [state.step2, state.step3],
      select: FSM.selection.firstNextState,
      action: () => console.log('continuing to next step ...'),
    },
    backToPreviousStep: {
      from: () => [state.step2, state.step3],
      to: () => [state.step1, state.step2, state.step3],
      select: FSM.selection.firstPreviousState,
      action: () => console.log('stepping back to previous step ...'),
    },
    firstToSecond: {
      from: () => [state.step1],
      to: () => [state.step2],
      action: (fsm, from, to) => {
        console.log('stepping forward from step 1 to step 2 ...')
        expect(fsm.currentState).toEqual(fsm.states.step1)
        expect(fsm.currentState).toEqual(state.step1)
        expect(from).toEqual(fsm.states.step1)
        expect(to).toEqual(fsm.states.step2)
      },
    }
  }

  return Object.freeze({ state, transitionDefiniton })
}

describe('Stepping with continue', () => {
  const { state, transitionDefiniton } = stepStateMachine()
  const fsm = new FSM(state, transitionDefiniton, state.step1)
  it('FSM is in step 1', () => {
    expect(fsm.currentState).toEqual(state.step1)
  })
  it('Can continue to step 2', () => {
    fsm.transitionTo(state.step2)
    expect(fsm.currentState).toEqual(state.step2)
  })
  it('Can step back to step 2', () => {
    fsm.transitionByDefinition(transitionDefiniton.backToPreviousStep)
    expect(fsm.currentState).toEqual(state.step1)
  })
})

describe('Stepping with firstToSecond', () => {
  const { state, transitionDefiniton } = stepStateMachine()
  const fsm = new FSM(state, transitionDefiniton, state.step1)

  it('Step from 1 to step 2', () => {
    fsm.transitionByDefinition(transitionDefiniton.firstToSecond)
    expect(fsm.currentState).toEqual(state.step2)
  })
})

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
    continueToLastStep: {
      from: () => [state.step1],
      to: () => [state.step2, state.step3],
      select: FSM.selection.lastNextState,
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
    expect(fsm.currentState).toEqual(state.step2)
    expect(fsm.canTransitionTo(state.step1)).toBe(true)
    fsm.transitionByDefinition(transitionDefiniton.backToPreviousStep)
    expect(fsm.currentState).toEqual(state.step1)
  })
  it('Can jump to step 3', () => {
    expect(fsm.currentState).toEqual(state.step1)
    expect(fsm.canTransitionTo(state.step3)).toBe(true)
    fsm.transitionByDefinition(transitionDefiniton.continueToLastStep)
    expect(fsm.currentState).toEqual(state.step3)
  })
  it('Cannot jump to non existing state', () => {
    const selectNonExisting = ts => ts.filter(t => t.toState.name === 'Non existing')
    try {
      fsm.transitionByFilter(selectNonExisting)
    } catch (e) {
      expect(e.fsm).toBe(fsm)
      expect(e.possibleTransitions.length).toEqual(1)
      expect(e.impossibleTransitions.length).toEqual(0)
    }
  })
  it('Can jump by Filter back to step 1', () => {
    const step1 = ts => ts.filter(t => t.toState.order === 1)
    fsm.transitionByFilter(step1)
    expect(fsm.currentState).toEqual(state.step1)
  })
  it('Transition to max state', () => {
    fsm.transitionByFilter(FSM.filter.maxState)
    expect(fsm.currentState).toEqual(state.step3)
  })
  it('Transition to min state', () => {
    fsm.transitionByFilter(FSM.filter.minState)
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

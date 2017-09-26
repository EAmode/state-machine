import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subject } from 'rxjs/Subject'
import { unnest, map, minBy, find } from 'ramda'
import { State, Transition } from './types'

export class FSM {
  static selection = {
    allPossible: (tansitions, currentState) => tansitions.filter(t => t.isPossible),
    firstNextState: (tansitions, currentState) => {
      const selectedTransitions =
        tansitions
          .filter(t => t.isPossible && t.toState.order && t.toState.order > currentState.order)
          .sort((tl, tr) => (tl.order && tr.order) ? tl.order - tr.order : 0)
      if (selectedTransitions && selectedTransitions.length > 0) {
        return selectedTransitions[0]
      } else {
        return []
      }
    },
    firstPreviousState: (tansitions, currentState) => {
      const selectedTransitions =
        tansitions
          .filter(t => t.isPossible && t.toState.order && t.toState.order < currentState.order)
          .sort((tl, tr) => (tl.order && tr.order) ? tl.order - tr.order : 0)
      if (selectedTransitions && selectedTransitions.length > 0) {
        return selectedTransitions[0]
      } else {
        return []
      }
    },
    allPreviousStates: (tansitions, currentState) => {
      const selectedTransitions =
        tansitions
          .filter(t => t.isPossible && t.toState.order && t.toState.order < currentState.order)
          .sort((tl, tr) => (tl.order && tr.order) ? tl.order - tr.order : 0)
      if (selectedTransitions && selectedTransitions.length > 0) {
        return selectedTransitions
      } else {
        return []
      }
    },
  }
  possibleTransitions: Array<Transition>
  possibleTransitionInstances$: Subject<any>
  transition$: Subject<any>
  currentState: State

  get valid() {
    return (this.currentState.valid) ? true : false
  }

  set valid(value) {
    this.currentState.valid = value
    this.update()
  }

  constructor(
    public states,
    public transitionDefinitions,
    public startState: any = {},
    public data = {}
  ) {
    this.possibleTransitionInstances$ = new BehaviorSubject(null)
    this.transition$ = new BehaviorSubject(null)
    map(s => this.ensureStateValues(s), states)
    this.ensureStateValues(startState)
    startState.startState = true
    startState.count++
    if (startState.onEnter) {
      startState.onEnter()
    }
    this.currentState = startState
    this.possibleTransitions = this.possibleTransitionInstances()
  }

  private ensureStateValues(state) {
    if (!state.count) {
      state.count = 0
    }
    if (!state.order) {
      state.order = 0
    }
    if (!state.valid) {
      state.valid = false
    }
    if (!state.changed) {
      state.changed = false
    }
  }

  changeData(data) {
    this.data = data
    this.update()
  }

  changeStateData(state, data) {
    state.data = data
    // TODO support undo/history of changed data
    state.changed = true
    this.update()
  }

  changeCurrentStateData(data) {
    this.changeStateData(this.currentState, data)
  }

  canTransitionTo(state: State) {
    return this.possibleTransitions.find(t => t.toState === state) ? true : false
  }

  transitionTo(toState) {
    const firstpossibleTransition = this.possibleTransitions.find(t => t.toState === toState)
    if (firstpossibleTransition) {
      this.transition(firstpossibleTransition)
    } else {
      throw new TransitionNotPossibleError('Transition is not available to this state!')
    }
  }

  transition(transition) {
    if (transition.fromState !== this.currentState) {
      throw new TransitionNotPossibleError('Transition is not available for this current state!')
    }

    // TODO: check if toState exists

    const failingGuards = this.checkGuards(transition.transitionDefinition, transition.fromState, transition.toState)
    if (failingGuards.length > 0) {
      throw new TransitionNotPossibleError('Transition not allowed by guards!', failingGuards)
    }

    if (transition.fromState.onExit) {
      transition.fromState.onExit(this)
    }
    if (transition.transitionDefinition.action) {
      transition.transitionDefinition.action()
    }
    this.currentState = transition.toState
    if (transition.toState.onEnter) {
      transition.toState.onEnter(this.states)
    }
    transition.toState.count++
    transition.fromState.changed = false
    this.update()
    this.transition$.next(transition)
  }

  transitionByDefinition(transitionDefinition, toState = null) {
    const transitions = this.possibleTransitions.filter(t => t.transitionDefinition === transitionDefinition)
    if (transitions.length === 0) {
      throw new TransitionNotPossibleError('Transition Definition not available for current state!')
    }
    let selectedTransition
    if (transitions.length > 1) {
      if (!toState) {
        throw new TransitionNotPossibleError('Multiple possible toStates found and no toState specified!')
      } else {
        selectedTransition = this.possibleTransitions.find(s => s === toState)
        if (!selectedTransition) {
          throw new TransitionNotPossibleError('The specified toState can not be reached with this transition!')
        }
      }
    } else {
      selectedTransition = transitions[0]
    }
    this.transition(selectedTransition)
  }

  update() {
    this.possibleTransitions = this.possibleTransitionInstances()
    // TODO: only send if changed
    this.possibleTransitionInstances$.next(this.possibleTransitions)
  }

  checkGuards(transitionDefinition, fromState, toState): Array<any> {
    if (transitionDefinition.guards) {
      return transitionDefinition.guards.filter(guard => {
        const guardCondition = guard(this, fromState, toState)
        if (guardCondition !== undefined && guardCondition === false) {
          return true
        }
      })
    }
    return []
  }

  possibleTransitionInstancesFor(transitionDefinition) {
    if (!transitionDefinition) {
      throw new TransitionDefinitionNotExistsError('Definition for this transition does not exists!')
    }
    const fromStates = transitionDefinition.from(this.currentState)

    if (fromStates.includes(this.currentState)) {
      const toStates = transitionDefinition.to(this.currentState)

      if (toStates) {
        const allTransitions = toStates.map(toState => {
          const failingGuards = this.checkGuards(transitionDefinition, this.currentState, toState)

          return {
            fromState: this.currentState,
            toState: toState,
            isPossible: failingGuards.length === 0,
            failingGuards,
            transitionDefinition
          }
        })
        if (transitionDefinition.select) {
          return transitionDefinition.select(allTransitions, this.currentState)
        } else {
          return FSM.selection.allPossible(allTransitions, this.currentState)
        }
      } else {
        return []
      }
    } else {
      return []
    }
  }

  possibleTransitionInstances() {
    const transactionInstances = []
    // tslint:disable-next-line:forin
    for (const td in this.transitionDefinitions) {
      transactionInstances.push(this.possibleTransitionInstancesFor(this.transitionDefinitions[td]))
    }
    const un = unnest(transactionInstances)

    return un
  }
}

export class TransitionNotPossibleError extends Error {
  constructor(m: string, public failingGuards = []) {
    super(m)
    Object.setPrototypeOf(this, TransitionNotPossibleError.prototype)
  }
}

export class TransitionDefinitionNotExistsError extends Error {
  constructor(m: string) {
    super(m)
    Object.setPrototypeOf(this, TransitionNotPossibleError.prototype)
  }
}

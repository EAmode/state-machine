import { Subject } from 'rxjs'
import { TransitionDefinitionNotExistsError, TransitionNotPossibleError } from './exceptions'
import {
  State,
  StateMap,
  StateResolveFunc,
  Transition,
  TransitionDefinition,
  TransitionDefinitionMap,
  TransitionFilter,
} from './types'

export class FSM {
  static selection = {
    allPossible: tansitions => tansitions.filter(t => t.isPossible),
    firstNextState: (tansitions, currentState) => {
      const selectedTransitions = tansitions
        .filter(t => t.isPossible && t.toState.order && t.toState.order > currentState.order)
        .sort((tl, tr) => (tl.order && tr.order ? tl.order - tr.order : 0))
      if (selectedTransitions && selectedTransitions.length > 0) {
        return selectedTransitions[0]
      } else {
        return []
      }
    },
    lastNextState: (tansitions, currentState) => {
      const selectedTransitions = tansitions
        .filter(t => t.isPossible && t.toState.order && t.toState.order > currentState.order)
        .sort((tl, tr) => (tl.order && tr.order ? tl.order - tr.order : 0))
      if (selectedTransitions && selectedTransitions.length > 0) {
        return selectedTransitions[selectedTransitions.length - 1]
      } else {
        return []
      }
    },
    firstPreviousState: (tansitions, currentState) => {
      const selectedTransitions = tansitions
        .filter(t => t.isPossible && t.toState.order && t.toState.order < currentState.order)
        .sort((tl, tr) => (tl.order && tr.order ? tl.order - tr.order : 0))
      if (selectedTransitions && selectedTransitions.length > 0) {
        return selectedTransitions[0]
      } else {
        return []
      }
    },
    allPreviousStates: (tansitions, currentState) => {
      const selectedTransitions = tansitions
        .filter(t => t.isPossible && t.toState.order && t.toState.order < currentState.order)
        .sort((tl, tr) => (tl.order && tr.order ? tl.order - tr.order : 0))
      if (selectedTransitions && selectedTransitions.length > 0) {
        return selectedTransitions
      } else {
        return []
      }
    },
  }

  static filter: { [key: string]: TransitionFilter } = {
    possibleTransitions: ts => ts.filter(t => t.failingGuards.length === 0),
    impossibleTransitions: ts => ts.filter(t => t.failingGuards.length !== 0),
    minState: ts => [
      ts.reduce((prev, next) => (next.toState.order < prev.toState.order ? next : prev)),
    ],
    maxState: ts => [
      ts.reduce((prev, next) => (next.toState.order > prev.toState.order ? next : prev)),
    ],
  }
  currentTransitions: Transition[]
  possibleTransitionInstances$: Subject<any>
  transition$ = new Subject<Transition>()
  currentState: State

  get valid() {
    return this.currentState.valid ? true : false
  }

  set valid(value) {
    this.currentState.valid = value
    this.update()
  }

  constructor(
    public states: StateMap,
    public transitionDefinitions: TransitionDefinitionMap,
    public startState: State = { name: '' },
    public data = {}
  ) {
    this.possibleTransitionInstances$ = new Subject()
    Object.values(states).map(s => this.ensureStateValues(s))
    this.ensureStateValues(startState)
    startState.isStartState = true
    startState.count++
    this.currentState = startState

    this.currentTransitions = this.possibleTransitionInstances()
  }

  initialize(data) {
    const { startState } = this
    this.data = data
    startState.count++
    if (startState.onEnter) {
      startState.onEnter(this, null, startState)
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

  canTransition() {
    return this.currentTransitions.length > 0
  }

  canTransitionTo(state: State) {
    return this.currentTransitions.find(t => t.toState === state) ? true : false
  }

  transitionTo(toState) {
    const firstpossibleTransition = this.currentTransitions.find(t => t.toState === toState)
    if (firstpossibleTransition) {
      this.transition(firstpossibleTransition)
    } else {
      throw new TransitionNotPossibleError('Transition is not available to this state!')
    }
  }

  transition(transition: Transition) {
    if (transition.fromState !== this.currentState) {
      throw new TransitionNotPossibleError('Transition is not available for this current state!')
    }

    // TODO: check if toState exists
    const failingGuards = this.checkGuards(
      transition.transitionDefinition,
      transition.fromState,
      transition.toState
    )
    if (failingGuards.length > 0) {
      throw new TransitionNotPossibleError('Transition not allowed by guards!', failingGuards)
    }

    if (transition.fromState.onExit) {
      transition.fromState.onExit(this, transition.fromState, transition.toState)
    }
    if (transition.transitionDefinition.action) {
      transition.transitionDefinition.action(this, transition.fromState, transition.toState)
    }
    this.currentState = transition.toState
    if (transition.toState.onEnter) {
      transition.toState.onEnter(this, transition.fromState, transition.toState)
    }
    transition.toState.count++
    transition.fromState.changed = false
    this.update()
    this.transition$.next(transition)
  }

  transitionByFilter(filter: TransitionFilter) {
    const transitions = filter(FSM.filter.possibleTransitions(this.currentTransitions), this)
    if (transitions.length === 0) {
      throw new TransitionNotPossibleError(
        'Transition Filter has no transitions for current state!',
        this,
        FSM.filter.possibleTransitions(this.currentTransitions),
        FSM.filter.impossibleTransitions(this.currentTransitions)
      )
    }
    this.transition(transitions[0])
  }

  transitionByDefinition(transitionDefinition, toState = null) {
    const transitions = this.currentTransitions.filter(
      t => t.transitionDefinition === transitionDefinition
    )
    if (transitions.length === 0) {
      throw new TransitionNotPossibleError('Transition Definition not available for current state!')
    }
    let selectedTransition
    if (transitions.length > 1) {
      if (!toState) {
        throw new TransitionNotPossibleError(
          'Multiple possible toStates found and no toState specified!'
        )
      } else {
        selectedTransition = this.currentTransitions.find(s => s === toState)
        if (!selectedTransition) {
          throw new TransitionNotPossibleError(
            'The specified toState can not be reached with this transition!'
          )
        }
      }
    } else {
      selectedTransition = transitions[0]
    }
    this.transition(selectedTransition)
  }

  update() {
    this.currentTransitions = this.possibleTransitionInstances()
    // TODO: only send if changed
    this.possibleTransitionInstances$.next(this.currentTransitions)
  }

  checkGuards(transitionDefinition, fromState, toState): any[] {
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

  resolveState(stateMapping: State | State[] | StateResolveFunc): State[] {
    const type = Object.prototype.toString.call(stateMapping)
    if (type === '[object Object]') {
      return [stateMapping as State]
    } else if (type === '[object Array]') {
      return stateMapping as State[]
    } else {
      const result = (stateMapping as StateResolveFunc)(this)
      return result instanceof Array ? result : [result]
    }
  }

  possibleTransitionInstancesFor(transitionDefinition: TransitionDefinition) {
    if (!transitionDefinition) {
      throw new TransitionDefinitionNotExistsError(
        'Definition for this transition does not exists!'
      )
    }
    const fromStates = this.resolveState(transitionDefinition.from)

    if (fromStates.includes(this.currentState)) {
      const toStates = this.resolveState(transitionDefinition.to)

      if (toStates) {
        const allTransitions = toStates.map(toState => {
          const failingGuards = this.checkGuards(transitionDefinition, this.currentState, toState)

          return {
            fromState: this.currentState,
            toState,
            isPossible: failingGuards.length === 0,
            failingGuards,
            transitionDefinition,
          }
        })
        if (transitionDefinition.select) {
          return transitionDefinition.select(allTransitions, this.currentState)
        } else {
          return FSM.selection.allPossible(allTransitions)
        }
      } else {
        return []
      }
    } else {
      return []
    }
  }

  possibleTransitionInstances() {
    const transactionInstances: Transition[] = []
    for (const td in this.transitionDefinitions) {
      if (this.transitionDefinitions.hasOwnProperty(td)) {
        const possibleInstances = this.possibleTransitionInstancesFor(
          this.transitionDefinitions[td]
        )
        if (possibleInstances instanceof Array) {
          possibleInstances.forEach(i => {
            transactionInstances.push(i)
          })
        } else {
          transactionInstances.push(possibleInstances)
        }
      }
    }

    return transactionInstances
  }

  private ensureStateValues(state: State) {
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
}

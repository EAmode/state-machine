import { FSM } from './ea-state-machine'

export interface State {
  name: string,
  count?: number,
  order?: number,
  valid?: boolean,
  data?: any
}

export interface StateMap {
  [index: string]: State
  [index: number]: State
}

export interface Transition {
  name: string,
  failingGuards: Array<Guard>
  fromState: State,
  toState: State,
  transitionDefinition: TransitionDefinition
}

export interface TransitionDefinition {
  name: string,
  order: number,
  valid: boolean,
  data?: any,
  select?(transitions, fsm),
  from(currentState: State): Array<State>,
  to(currentState: State): Array<State>,
}

export interface Guard {
  (allStates: string,
    to: number,
    order: number,
    valid: boolean,
    data?: any)
}

export type TransitionFilter = (tansitions: Array<Transition>, fsm?: FSM) => Array<Transition>

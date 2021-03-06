import { FSM } from './index'

export interface State {
  name: string
  count?: number
  order?: number
  isStartState?: boolean
  valid?: boolean
  changed?: boolean
  data?: any
  path?: string
  component?: any
  onEnter?: StateMachineFunc
  onExit?: StateMachineFunc
  apply?: never
}

export interface StateMap {
  [index: string]: State
  [index: number]: State
}

export interface Transition {
  name: string
  failingGuards: Guard[]
  fromState: State
  toState: State
  order?: number
  isPossible?: boolean
  data?: any
  transitionDefinition: TransitionDefinition
  fsm: FSM
}
export interface TransitionDefinitionMap {
  [index: string]: TransitionDefinition
  [index: number]: TransitionDefinition
}

export interface TransitionDefinition {
  name?: string
  order?: number
  valid?: boolean
  data?: any
  guards?: Guard[]
  from: State | State[] | StateResolveFunc
  to: State | State[] | StateResolveFunc
  action?: (t: Transition) => void
  select?: (transitions: Transition[], fsm: FSM) => any
}

export type StateResolveFunc = (fsm: FSM) => State | State[]

export type StateMachineFunc = (fsm: FSM, from: State, to: State) => void

export interface Guard {
  (fsm: FSM, from: State, to: State, data?: any): any
}

export type TransitionFilter = (tansitions: Transition[], fsm: FSM, data?: any) => Transition[]

export interface TransitionFilterMap {
  [index: string]: TransitionFilter
  [index: number]: TransitionFilter
}

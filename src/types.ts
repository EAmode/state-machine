import { FSM } from './ea-state-machine'

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
  data?: any
  transitionDefinition: TransitionDefinition
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
  action?: StateMachineFunc
  select?(transitions, fsm)
}

export type StateResolveFunc = (fsm: FSM) => State | State[]

export type StateMachineFunc = (fsm: FSM, from: State, to: State) => void

export interface Guard {
  (allStates: string, to: number, order: number, valid: boolean, data?: any)
}

export type TransitionFilter = (tansitions: Transition[], fsm?: FSM) => Transition[]

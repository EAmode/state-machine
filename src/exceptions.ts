export class TransitionDefinitionNotExistsError extends Error {
  constructor(m: string) {
    super(m)
    Object.setPrototypeOf(this, TransitionDefinitionNotExistsError.prototype)
  }
}

// tslint:disable-next-line:max-classes-per-file
export class TransitionNotPossibleError extends Error {
  constructor(
    m: string,
    public fsm = {},
    public possibleTransitions = [],
    public impossibleTransitions = []
  ) {
    super(m)
    Object.setPrototypeOf(this, TransitionNotPossibleError.prototype)
  }
}

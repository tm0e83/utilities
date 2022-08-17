/**
 * DEPRECATED - use Redux instead
 */

import Mediator from './mediator.js';

class DataStorage extends Mediator {
  constructor(reducer, initialState) {
    super();
    if (reducer);
    this.init(reducer, initialState || {});
  }

  init(reducer, initialState = {}) {
    this.reducer = reducer;
    this.initialState = initialState;
    this.publish('init', this.initialState);
  }

  dispatch(action) {
    this.state = this.reducer(this.state || this.initialState, action);
    this.publish('update', this.state, action);
  }

  getState() {
    return this.state || this.initialState;
  }

  getInitialState() {
    return this.initialState;
  }

  get initialized() {
    return typeof this.reducer !== 'undefined';
  }
}

export { DataStorage };

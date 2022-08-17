import {
  combineReducers,
  createStore
} from 'application/node_modules/redux';

export const createReducer = (...asyncReducers) => {
  return combineReducers(
    Object.assign({}, ...asyncReducers)
  );
};

export const configureStore = (initialState = {}) => {
  const store = createStore(defaultReducer, initialState);
  store.asyncReducers = {};
  return store;
};

export const injectAsyncReducer = (store, name, asyncReducer = defaultReducer) => {
  store.asyncReducers[name] = asyncReducer;
  store.replaceReducer(createReducer(store.asyncReducers));
};

const defaultReducer = (state = {}, action) => {
  let nextState = Object.assign({}, state);

  switch (action.type) {
    default:
      return nextState;
  }
};
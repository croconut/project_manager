import throttle from "lodash/throttle";
import { createStore } from "redux";
import rootReducer from "./reducers";

const configureStore = () => {
  const store = createStore(rootReducer);

  // probably wanna parse for updates
  // and save to server
  store.subscribe(throttle(() => {
    /* */
  }, 2000));

  return store;
}

export default configureStore;
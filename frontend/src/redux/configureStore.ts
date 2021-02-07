import { throttle }from "lodash";
import { createStore } from "redux";
import Freezer from "./freezer";
import rootReducer from "./reducers";

const configureStore = () => {
  const store = createStore(Freezer(rootReducer));


  // probably wanna parse for updates
  // and save to server
  store.subscribe(throttle(() => {
    /* */
  }, 2000));

  return store;
}

export default configureStore;
export type RootStore = ReturnType<typeof configureStore>;

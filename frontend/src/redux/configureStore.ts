import { throttle } from "lodash";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { UpdateType } from "src/staticData/types";
import Freezer from "./freezer";
import rootReducer from "./reducers";
import { ID_ADDITION } from "./reducers/storeState";
import { getTasklistById, getUpdateObject } from "./selectors";

const configureStore = () => {
  const store = createStore(Freezer(rootReducer), applyMiddleware(thunk));

  // probably wanna parse for updates
  // and save to server
  store.subscribe(
    throttle(() => {
      /* */
      const state = store.getState();
      const updates = getUpdateObject(state);
      const list = Object.keys(updates);
      if (list.length > 0) {
        let i = 0;
        for (; i < list.length; i++) {
          // ensuring we're not getting one of the duplicate changes
          if (list[i][list[i].length - 1] !== ID_ADDITION) break;
        }
        if (i === list.length) {
          console.error("subscribe function broke bruh, all the ids are bad");
          console.error(updates);
          console.error(list);
          return;
        }
        const id = list[i];
        const update = updates[id];
        const tasklist = getTasklistById(state, { id });
        if (tasklist === null) {
          console.error("updates for tasklist that has been deleted should have been removed");
          return;
        }
        const endObject: Update = {};
        const types = Object.keys(update.types);
        types.forEach((type) => {
          switch (parseInt(type)) {
            case UpdateType.ADD_TASK:
            // add the last item in the given tasklist
              endObject.add

          }
        });
      }
    }, 1500)
  );

  return store;
};

export default configureStore;
export type RootStore = ReturnType<typeof configureStore>;

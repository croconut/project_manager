import { throttle } from "lodash";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { IParsedUpdate, UpdateType } from "src/staticData/types";
import { updateTasklistAttempt } from "./actions";
import Freezer from "./freezer";
import rootReducer from "./reducers";
import { ID_ADDITION } from "src/staticData/Constants";
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
      if (list.length <= 0) return;
      let i = 0;
      for (; i < list.length; i++) {
        // ensuring we're not getting one of the duplicate changes
        if (updates[list[i]].updating === true) continue;
        else if (list[i][list[i].length - 1] !== ID_ADDITION) break;
      }
      if (i === list.length) {
        return;
      }
      const id = list[i];
      const update = updates[id];
      if (update.types[UpdateType.REMOVE_USER] !== undefined) {
        console.warn("need to implement and issue account deletion request");
        return;
      }
      if (update.types[UpdateType.USER_INFO] !== undefined) {
        console.warn("need to implement user information update request");
        return;
      }
      const tasklist = getTasklistById(state, { id });
      if (tasklist === null) {
        console.error(
          "update requests for a tasklist that has been deleted should have been removed"
        );
        return;
      }
      const endObject: IParsedUpdate = { _id: id };
      const types = Object.keys(update.types);
      types.forEach((type) => {
        switch (parseInt(type)) {
          // add the last item in the given tasklist
          case UpdateType.ADD_TASK:
            endObject.tasks = tasklist.tasks;
            endObject.stages = {
              stage1: tasklist.stage1,
              stage2: tasklist.stage2,
              stage3: tasklist.stage3,
              stage4: tasklist.stage4,
            };
            break;
          case UpdateType.SET_TASKS:
            endObject.tasks = tasklist.tasks;
            break;
          case UpdateType.REMOVE_TASKLIST:
            endObject.remove = true;
            break;
          case UpdateType.SET_STAGES:
            endObject.stages = {
              stage1: tasklist.stage1,
              stage2: tasklist.stage2,
              stage3: tasklist.stage3,
              stage4: tasklist.stage4,
            };
            endObject.taskslength = tasklist.tasks.length;
            break;
          case UpdateType.TASKLIST_INFO:
            endObject.name = tasklist.name;
            endObject.description = tasklist.description;
            break;
          default:
            break;
        }
      });
      if (endObject.tasks !== undefined && endObject.tasks.length < 1) endObject.empty = true;
      // this library doesn't really like typescript here
      store.dispatch(updateTasklistAttempt(endObject, store) as any);
    }, 1500)
  );

  return store;
};

export default configureStore;
export type RootStore = ReturnType<typeof configureStore>;

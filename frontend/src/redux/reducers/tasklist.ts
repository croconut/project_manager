import * as types from "../../staticData/types";
import { AnyAction } from "redux";

// ids gives the array index for the associated tasklist
// this should have all the copy information required
const exampleTasklist: types.TasklistsHolder = fromJS({
  tasklists: [{ tasks: [{}] }],
  ids: {},
});
console.log(exampleTasklist);

const tasklistsHelper: Function = (
  state: types.TasklistsHolder,
  action: types.TasklistsAction
): types.TasklistsHolder => {
  switch (action.type) {
    case types.REPLACE_ALL_TASKLISTS:
      const lists: types.Tasklists = action.payload.tasklists;
      const ids: types.IDs = Map<string, number>().withMutations(function (
        ids
      ) {
        for (let i = 0; i < lists.size; i++) {
          ids.set(lists.getIn([i, "_ids"]), i);
        }
      });
      return Map({
        tasklists: lists,
        ids: ids,
      });
  }
  return state;
};

const tasklistHelper: Function = (
  state: types.TasklistsHolder,
  action: types.TasklistAction
): types.TasklistsHolder => {
  switch (action.type) {
    case types.ADD_TASKLIST:
      const size = state.get("tasklists")?.size;
      return state.withMutations(function (state) {
        state
          .setIn(
            ["ids", action.payload.tasklist.get("_id")],
            size
          )
          // .update("tasklists", (arr) => arr.push(action.payload.tasklist));
      });
  }
  return state;
};

// action payload has at least 2 required keys: .tasklist and .tasklist._id
// if doing single task actions it also requires .task and .task._id
// OR just one ==> tasklists
// tasklists and tasks are required to have unique id @ ._id

// changing this from anyaction to specifically the actions it's set up to work with
// based on types
export const tasklistHolder = (
  state = exampleTasklist,
  action: AnyAction
): types.TasklistsHolder => {
  if (types.isTasklistsAction(action)) return tasklistsHelper(state, action);
  else if (types.isTasklistAction(action)) return tasklistHelper(state, action);
  else if (types.isTaskAction(action)) return taskHelper(state, action);
  return state;
  switch (action.type) {
    case types.REPLACE_ALL_TASKLISTS:
      let ids = {};
      let list = action.payload.tasklists;
      for (let i = 0; i < list.length; i++) {
        ids[list[i]._id] = i;
      }
      return immutable.fromJS({
        tasklists: action.payload.tasklists,
        ids: ids,
      });
    case types.ADD_TASKLIST:
      return state.withMutations(function (state) {
        state
          .setIn(
            ["ids", action.payload.tasklist.get("_id")],
            state.get("tasklists").size
          )
          .update("tasklists", (arr) => arr.push(action.payload.tasklist));
      });
    case types.MODIFY_TASKLIST:
      return state.withMutations(function (state) {
        state.mergeIn(
          [
            "tasklists",
            state
              .get("tasklists")
              .findIndex(
                (item) => item.get("_id") === action.payload.tasklist.get("_id")
              ),
          ],
          action.payload.tasklist
        );
      });
    case types.REMOVE_TASKLIST:
      // let { [action.payload.tasklist._id]: omit, ...ids2} = state.ids;
      // cannot simply destructure as filter does in place removal:
      // all other indexes will increment
      let list2 = state.tasklists.filter(
        (item) => item._id !== action.payload.tasklist._id
      );
      let ids2 = {};
      for (let i = 0; i < list2.length; i++) {
        ids2[list2[i]._id] = i;
      }
      return {
        tasklists: list2,
        ids: ids2,
      };
    case types.ADD_TASK:
      return state.map((item) =>
        action.payload.tasklistID === item._id
          ? { ...item, tasks: [...item.tasks, action.payload.task] }
          : item
      );
    case types.MODIFY_TASK:
      return state.map((item) =>
        action.payload.tasklistID === item._id
          ? {
              ...item,
              tasks: item.tasks.map((task) =>
                task._id === action.payload.task._id
                  ? action.payload.task
                  : task
              ),
            }
          : item
      );
    case types.REMOVE_TASK:
      return state.map((item) =>
        action.payload.tasklistID === item._id
          ? {
              ...item,
              tasks: item.tasks.filter(
                (task) => task._id !== action.payload.task._id
              ),
            }
          : item
      );
    default:
      return state;
  }
};

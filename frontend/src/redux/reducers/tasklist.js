import * as types from "../actionTypes";
import immutable from "immutable";

// ids gives the array index for the associated tasklist
// this should have all the copy information required
const exampleTasklist = immutable.fromJS({
  tasklists: [{ tasks: [{}] }],
  ids: {},
});
console.log(exampleTasklist);

// action payload has at least 2 required keys: .tasklist and .tasklist._id
// if doing single task actions it also requires .task and .task._id
// OR just one ==> tasklists
// tasklists and tasks are required to have unique id @ ._id

// expects the payload to be a normal js object
// object becomes immutable
export const tasklistHolder = (state = exampleTasklist, action) => {
  if (action.payload) {
    if (action.payload.tasklist) {
      action.payload.tasklist = immutable.fromJS(action.payload.tasklist);
    } else if (action.payload.task) {
      action.payload.task = immutable.fromJS(action.payload.task);
    }
  }
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

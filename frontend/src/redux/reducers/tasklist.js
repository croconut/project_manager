import * as types from "../actionTypes";

// ids gives the array index for the associated tasklist
const exampleTasklist = { tasklists: [{}], ids: {} };

// action payload has at least 2 required keys: .tasklist and .tasklist._id
// if doing single task actions it also requires .task and .task._id
// OR just one ==> tasklists
// tasklists and tasks are required to have unique id @ ._id

export const tasklistHolder = (state = exampleTasklist, action) => {
  switch (action.type) {
    case types.REPLACE_ALL_TASKLISTS:
      let ids = {};
      let list = action.payload.tasklists;
      for (let i = 0; i < list.length; i++) {
        ids[list[i]._id] = i;
      }
      return { tasklists: action.payload.tasklists, ids: ids };
    case types.ADD_TASKLIST:
      let prevL = state.tasklists.length;
      return {
        tasklists: [...state.tasklists, action.payload.tasklist],
        ids: { ...state.ids, [action.payload.tasklist._id]: prevL },
      };
    case types.MODIFY_TASKLIST:
      // map is just crazy slow buuuut i want a copy of the array anyways
      // for 'immutability' purposes :d
      // important to not that this cannot change the _id of the tasklist
      return {
        tasklists: state.tasklists.map((item) =>
          item._id === action.payload.tasklist._id
            ? action.payload.tasklist
            : item
        ),
        ids: state.ids,
      };
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

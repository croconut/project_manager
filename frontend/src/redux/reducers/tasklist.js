import * as types from "../actionTypes";

const exampleTasklist = [{}];

// action payload has at least 2 required keys: .tasklist and .tasklistID
// if doing single task actions it also requires .task and .taskID
// OR just one ==> tasklists

export const tasklistReducer = (state = exampleTasklist, action) => {
  switch (action.type) {
    case types.REPLACE_ALL_TASKLISTS:
      return action.payload.tasklists;
    case types.ADD_TASKLIST:
      return [...state, action.payload.tasklist];
    case types.MODIFY_TASKLIST:
      return state.map((item) =>
        item._id === action.payload.tasklistID ? action.payload.tasklist : item
      );
    case types.REMOVE_TASKLIST:
      return state.filter((item) => item._id !== action.payload.tasklistID);
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
                task._id === action.payload.itemID ? action.payload.task : task
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
                (task) => task._id !== action.payload.itemID
              ),
            }
          : item
      );
    default:
      return state;
  }
};

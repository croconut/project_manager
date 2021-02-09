import * as types from "../../staticData/types";
import { TaskStage } from "src/staticData/Constants";

// ids gives the array index for the associated tasklist
// this should have all the copy information required
var defaultTasklists: types.ITasklistsHolder = {
  tasklists: [
    {
      description: "",
      _id: "RANDOM_garbageLOL1235",
      name: "",
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
      tasks: [
        {
          name: "",
          description: "",
          _id: "",
          assignedUsername: "",
          stage: TaskStage[0],
          assignedUserIcon: "",
        },
      ],
    },
  ],
  ids: { RANDOM_garbageLOL1235: 0 },
};

// action payload has at least 2 required keys: .tasklist and .tasklist._id
// if doing single task actions it also requires .task and .task._id
// OR just one ==> tasklists
// tasklists and tasks are required to have unique id @ ._id

// changing this from anyaction to specifically the actions it's set up to work with
// based on types
export const tasklistHolder = (
  // ensures that undefined case still has defined initial state
  state: types.ITasklistsHolder = defaultTasklists,
  action: types.AllTasklistActions
): types.ITasklistsHolder => {
  switch (action.type) {
    case types.REPLACE_ALL_TASKLISTS:
      const lists: types.TTasklists = action.payload.tasklists;
      const ids: types.IIDs = {};
      for (let i = 0; i < lists.length; i++) {
        ids[lists[i]._id] = i;
      }
      return {
        tasklists: lists,
        ids: ids,
      };
    case types.ADD_TASKLIST:
      return {
        tasklists: [...state.tasklists, action.payload.tasklist],
        ids: {
          ...state.ids,
          [action.payload.tasklist._id]: state.tasklists.length,
        },
      };
    case types.MODIFY_TASKLIST:
      const index1: number | undefined = state.ids[action.payload.tasklist._id];
      // want to allow modifications to the zero state
      if (!index1 && index1 !== 0) return state;
      let sliced = state.tasklists.slice();
      sliced[index1] = action.payload.tasklist;
      return {
        tasklists: sliced,
        ids: state.ids,
      };
    case types.REMOVE_TASKLIST:
      const index2: number | undefined = state.ids[action.payload.tasklist._id];
      if (!index2 && index2 !== 0) return state;
      const lists1 = [
        ...state.tasklists.slice(0, index2),
        ...state.tasklists.slice(index2 + 1),
      ];
      const ids1: types.IIDs = {};
      // probably faster to recreate from scratch anyway
      for (let i = 0; i < lists1.length; i++) {
        ids1[lists1[i]._id] = i;
      }
      return {
        tasklists: lists1,
        ids: ids1,
      };
    default:
      return state;
  }
};

export type TTasklistReducer = ReturnType<typeof tasklistHolder>;

import * as types from "../../staticData/types";
import { TaskStage } from "src/staticData/Constants";

// ids gives the array index for the associated tasklist
// this should have all the copy information required
export const defaultTasklists: types.ITasklistsHolder = {
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
          assignedUserIcon: "",
        },
      ],
      stage1: [0],
      stage2: [],
      stage3: [],
      stage4: [],
    },
  ],
  ids: { RANDOM_garbageLOL1235: 0 },
};

// handles restaging or reordering now
const restageHelper = (
  tasklist: types.ITasklist,
  action: types.TaskStageAction
): types.ITasklistStages => {
  // extract the task's index from the tasks array
  const index = tasklist.tasks.reduce(
    (accumulator, element, index) =>
      element._id === action.payload.taskID ? index : accumulator,
    -1
  );
  // remove the item from the old array
  const toReturn: types.ITasklistStages = {
    stage1: [...tasklist.stage1],
    stage2: [...tasklist.stage2],
    stage3: [...tasklist.stage3],
    stage4: [...tasklist.stage4],
  };
  switch (action.payload.oldStage) {
    case TaskStage[0]:
      toReturn.stage1 = toReturn.stage1.filter((e) => e !== index);
      break;
    case TaskStage[1]:
      toReturn.stage2 = toReturn.stage2.filter((e) => e !== index);
      break;
    case TaskStage[2]:
      toReturn.stage3 = toReturn.stage3.filter((e) => e !== index);
      break;
    case TaskStage[3]:
      toReturn.stage4 = toReturn.stage4.filter((e) => e !== index);
      break;
    default:
      break;
  }
  // insert the item to the new array, this splice directly changes the given array
  switch (action.payload.stage) {
    case TaskStage[0]:
      toReturn.stage1.splice(action.payload.priority, 0, index);
      break;
    case TaskStage[1]:
      toReturn.stage2.splice(action.payload.priority, 0, index);
      break;
    case TaskStage[2]:
      toReturn.stage3.splice(action.payload.priority, 0, index);
      break;
    case TaskStage[3]:
      toReturn.stage4.splice(action.payload.priority, 0, index);
      break;
    default:
      break;
  }
  return toReturn;
};

const removeTaskHelper = (
  tasklist: types.ITasklist,
  action: types.TaskAction
): types.ITasklistPartialStages => {
  const index = tasklist.tasks.reduce(
    (accumulator, element, index) =>
      element._id === action.payload.task._id ? index : accumulator,
    -1
  );
  return {
    // remove the offender, wherever it may be
    // increment the higher indices
    stage1: tasklist.stage1
      .filter((e) => e !== index)
      .map((e) => (e > index ? e - 1 : e)),
    stage2: tasklist.stage2
      .filter((e) => e !== index)
      .map((e) => (e > index ? e - 1 : e)),
    stage3: tasklist.stage3
      .filter((e) => e !== index)
      .map((e) => (e > index ? e - 1 : e)),
    stage4: tasklist.stage4
      .filter((e) => e !== index)
      .map((e) => (e > index ? e - 1 : e)),
  };
};

const updateTasklistHelper = (
  state: types.ITasklistsHolder,
  action: types.TasklistUpdatedAction | types.TasklistAction
) => {
  const index: number | undefined = state.ids[action.payload.tasklist._id];
  // want to allow modifications to the zero state
  if (!index && index !== 0) return state;
  let sliced = state.tasklists.slice();
  sliced[index] = action.payload.tasklist;
  return {
    tasklists: sliced,
    ids: state.ids,
  };
};

const createValidTasklist = (tasklist: types.ITasklist) => {
  var stageCount = tasklist.tasks.length;
  if (
    stageCount !==
    tasklist.stage1.length +
      tasklist.stage2.length +
      tasklist.stage3.length +
      tasklist.stage4.length
  ) {
    const obj: { [key: number]: number } = {};
    for (let i = 0; i < stageCount; i++) obj[i] = 0;
    tasklist.stage1 = tasklist.stage1
      .map((e: number) => {
        obj[e] = 1;
        return e < stageCount && e > -1 ? e : -1;
      })
      .filter((e) => e !== -1);
    tasklist.stage2 = tasklist.stage2
      .map((e: number) => {
        obj[e] = 1;
        return e < stageCount && e > -1 ? e : -1;
      })
      .filter((e) => e !== -1);
    tasklist.stage3 = tasklist.stage3
      .map((e: number) => {
        obj[e] = 1;
        return e < stageCount && e > -1 ? e : -1;
      })
      .filter((e) => e !== -1);
    tasklist.stage4 = tasklist.stage4
      .map((e: number) => {
        obj[e] = 1;
        return e < stageCount && e > -1 ? e : -1;
      })
      .filter((e) => e !== -1);
    Object.keys(obj).forEach((key) => {
      const realKey = parseInt(key);
      if (obj[realKey] === 0) {
        tasklist.stage1.push(realKey);
      }
    });
    return tasklist;
  } else {
    return tasklist;
  }
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
  action: types.AnyCustomAction
): types.ITasklistsHolder => {
  switch (action.type) {
    case types.LOGOUT_COMPLETE:
      return defaultTasklists;
    case types.LOGIN_COMPLETE:
      var lists: types.TTasklists = action.payload.tasklists;
      const ids: types.IIDs = {};
      // must ensure valid stages on receipt of tasklist from server
      lists = lists.map((tasklist) => createValidTasklist(tasklist));
      for (let i = 0; i < lists.length; i++) {
        ids[lists[i]._id] = i;
      }
      return {
        tasklists: lists,
        ids: ids,
      };
    case types.TASKLIST_CREATED:
      return {
        tasklists: [...state.tasklists, action.payload.tasklist],
        ids: {
          ...state.ids,
          [action.payload.tasklist._id]: state.tasklists.length,
        },
      };
    case types.TASKLIST_UPDATED:
      if (action.payload.waitingNext) return state;
      return updateTasklistHelper(state, action);
    case types.MODIFY_TASKLIST:
      return updateTasklistHelper(state, action);
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
    case types.ADD_TASK:
      return {
        tasklists: state.tasklists.map((tasklist) => {
          if (tasklist._id !== action.payload.tasklistID) return tasklist;
          return {
            ...tasklist,
            stage1: [...tasklist.stage1, tasklist.tasks.length],
            tasks: [...tasklist.tasks, action.payload.task],
          };
        }),
        ids: state.ids,
      };
    // not allowed to restage or reprioritize task with the modify method
    case types.MODIFY_TASK:
      return {
        tasklists: state.tasklists.map((tasklist) => {
          if (tasklist._id !== action.payload.tasklistID) return tasklist;
          return {
            ...tasklist,
            tasks: tasklist.tasks.map((task) => {
              if (task._id !== action.payload.task._id) return task;
              return action.payload.task;
            }),
          };
        }),
        ids: state.ids,
      };
    case types.REMOVE_TASK:
      return {
        tasklists: state.tasklists.map((tasklist) => {
          if (tasklist._id !== action.payload.tasklistID) return tasklist;
          const tasks = tasklist.tasks.filter(
            (element) => element._id !== action.payload.task._id
          );
          const stages = removeTaskHelper(tasklist, action);
          return {
            ...tasklist,
            ...stages,
            tasks: tasks,
          };
        }),
        ids: state.ids,
      };
    case types.RESTAGE_TASK:
      return {
        tasklists: state.tasklists.map((tasklist) => {
          if (tasklist._id !== action.payload.tasklistID) return tasklist;
          return {
            ...tasklist,
            ...restageHelper(tasklist, action),
          };
        }),
        ids: state.ids,
      };
    default:
      return state;
  }
};

export default tasklistHolder;

export type TTasklistReducer = ReturnType<typeof tasklistHolder>;

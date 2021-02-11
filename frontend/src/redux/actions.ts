import * as types from "../staticData/types";



export const updateTasklistsFromServer = (
  tasklists: types.TTasklists
): types.TasklistsAction => ({
  type: types.REPLACE_ALL_TASKLISTS,
  payload: {
    tasklists: tasklists,
  },
});

export const modifyTasklist = (tasklist: types.ITasklist): types.TasklistAction => ({
  type: types.MODIFY_TASKLIST,
  payload: {
    tasklist: tasklist,
  },
});

export const addTasklist = (tasklist: types.ITasklist): types.TasklistAction => ({
  type: types.ADD_TASKLIST,
  payload: {
    tasklist: tasklist,
  },
});

export const removeTasklist = (tasklist: types.ITasklist): types.TasklistAction => ({
  type: types.REMOVE_TASKLIST,
  payload: {
    tasklist: tasklist,
  },
});

export const addTask = (tasklistID: string, task: types.ITask): types.TaskAction => ({
  type: types.ADD_TASK,
  payload: {
    tasklistID: tasklistID,
    task: task,
  },
});

export const modifyTask = (tasklistID: string, task: types.ITask): types.TaskAction => ({
  type: types.MODIFY_TASK,
  payload: {
    tasklistID: tasklistID,
    task: task,
  },
});

export const removeTask = (tasklistID: string, task: types.ITask): types.TaskAction => ({
  type: types.REMOVE_TASK,
  payload: {
    tasklistID: tasklistID,
    task: task,
  },
});

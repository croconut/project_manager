import * as types from "./actionTypes";

export const updateTasklistsFromServer = (tasklists) => ({
  type: types.REPLACE_ALL_TASKLISTS,
  payload: {
    tasklists: tasklists,
  },
});

export const modifyTasklist = (tasklist) => ({
  type: types.MODIFY_TASKLIST,
  payload: {
    tasklist: tasklist,
    tasklistID: tasklist._id,
  },
});

export const addTasklist = (tasklist) => ({
  type: types.ADD_TASKLIST,
  payload: {
    tasklist: tasklist,
    tasklistID: tasklist._id,
  },
});

export const removeTasklist = (tasklist) => ({
  type: types.REMOVE_TASKLIST,
  payload: {
    tasklist: tasklist,
    tasklistID: tasklist._id,
  },
});

export const addTask = (tasklist, task) => ({
  type: types.ADD_TASK,
  payload: {
    tasklist: tasklist,
    tasklistID: tasklist._id,
    task: task,
    taskID: task._id,
  },
});

export const modifyTask = (tasklist, task) => ({
  type: types.MODIFY_TASK,
  payload: {
    tasklist: tasklist,
    tasklistID: tasklist._id,
    task: task,
    taskID: task._id,
  },
});

export const removeTask = (tasklist, task) => ({
  type: types.REMOVE_TASK,
  payload: {
    tasklist: tasklist,
    tasklistID: tasklist._id,
    task: task,
    taskID: task._id,
  },
});

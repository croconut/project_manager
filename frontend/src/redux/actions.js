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
  },
});

export const addTasklist = (tasklist) => ({
  type: types.ADD_TASKLIST,
  payload: {
    tasklist: tasklist,
  },
});

export const removeTasklist = (tasklist) => ({
  type: types.REMOVE_TASKLIST,
  payload: {
    tasklist: tasklist,
  },
});

export const addTask = (tasklist, task) => ({
  type: types.ADD_TASK,
  payload: {
    tasklist: tasklist,
    task: task,
  },
});

export const modifyTask = (tasklist, task) => ({
  type: types.MODIFY_TASK,
  payload: {
    tasklist: tasklist,
    task: task,
  },
});

export const removeTask = (tasklist, task) => ({
  type: types.REMOVE_TASK,
  payload: {
    tasklist: tasklist,
    task: task,
  },
});

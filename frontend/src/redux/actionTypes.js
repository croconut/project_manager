export const ADD_TASK = "ADD_TASK";
export const REMOVE_TASK = "REMOVE_TASK";
export const MODIFY_TASK = "MODIFY_TASK";
export const ADD_TASKLIST = "ADD_TASKLIST";
export const REMOVE_TASKLIST = "REMOVE_TASKLIST";
export const MODIFY_TASKLIST = "MODIFY_TASKLIST";
export const REPLACE_ALL_TASKLISTS = "REPLACE_ALL_TASKLISTS";
export const UPDATE_USER = "UPDATE_USER";

export const addTask = () => ({ type: ADD_TASK });
export const removeTask = () => ({ type: REMOVE_TASK });
export const modifyTask = () => ({ type: MODIFY_TASK });
export const addTasklist = () => ({ type: ADD_TASKLIST });
export const removeTasklist = () => ({ type: REMOVE_TASKLIST });
export const modifyTasklist = () => ({ type: MODIFY_TASKLIST });
export const replaceAllTasklists = () => ({ type: REPLACE_ALL_TASKLISTS });
export const updateUser = () => ({ type: UPDATE_USER });

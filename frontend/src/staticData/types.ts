import { Stage, TaskStage } from "./Constants";

export const ADD_TASK = "ADD_TASK" as const;
type add_task = typeof ADD_TASK;
export const REMOVE_TASK = "REMOVE_TASK" as const;
type remove_task = typeof REMOVE_TASK;
export const MODIFY_TASK = "MODIFY_TASK" as const;
type modify_task = typeof MODIFY_TASK;
export const ADD_TASKLIST = "ADD_TASKLIST" as const;
type add_tasklist = typeof ADD_TASKLIST;
export const REMOVE_TASKLIST = "REMOVE_TASKLIST" as const;
type remove_tasklist = typeof REMOVE_TASKLIST;
export const MODIFY_TASKLIST = "MODIFY_TASKLIST" as const;
type modify_tasklist = typeof MODIFY_TASKLIST;
export const REPLACE_ALL_TASKLISTS = "REPLACE_ALL_TASKLISTS" as const;
type replace_tasklists = typeof REPLACE_ALL_TASKLISTS;
export const UPDATE_USER = "UPDATE_USER" as const;
type update_user = typeof UPDATE_USER;
export const RESTAGE_TASK = "RESTAGE_TASK" as const;
type restage_task = typeof RESTAGE_TASK;
export const REORDER_TASK = "REORDER_TASK" as const;
type reorder_task = typeof REORDER_TASK;

export interface IUserInfo {
  icon: string;
  color: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface ITasklistsHolder {
  tasklists: TTasklists;
  ids: IIDs;
}

// this has dynamically generated ids
// based on the tasklist ids and therefore
// can only be considered an object who's keys are
// numbers
export interface IIDs {
  [key: string]: number;
}

export type TTasklists = Array<ITasklist>;

export interface ITasklist {
  description: string;
  _id: string;
  name: string;
  tasks: TTasks;
  createdAt: Date;
  updatedAt: Date;
}

export type TTasks = Array<ITask>;

export interface ITask {
  assignedUsername?: string;
  assignedUserIcon?: string;
  description: string;
  stage: Stage;
  _id: string;
  name: string;
  due?: Date;
  priority: number;
}

// these typeguards should only be necessary for server updates
export const isTasklists = (lists: any): lists is TTasklists => {
  return Array.isArray(lists) && lists.length > 0 && isTasklist(lists[0]);
};

export const isTasklist = (list: any): list is ITasklist => {
  if (list === null || typeof list !== "object") return false;
  const tasklist = list as ITasklist;
  return (
    tasklist._id !== undefined &&
    tasklist.createdAt !== undefined &&
    tasklist.description !== undefined &&
    tasklist.name !== undefined &&
    tasklist.updatedAt !== undefined &&
    isTasks(tasklist.tasks)
  );
};

export const isTasks = (tasks: any): tasks is TTasks => {
  return Array.isArray(tasks) && tasks.length > 0 && isTask(tasks[0]);
};

export const isTask = (obj: any): obj is ITask => {
  // null is an object for some reason
  if (obj === null || typeof obj !== "object") return false;
  const task = obj as ITask;
  return (
    task._id !== undefined &&
    task.description !== undefined &&
    task.name !== undefined &&
    task.priority !== undefined &&
    TaskStage.includes(task.stage)
  );
};

export type TasklistsAction = {
  type: replace_tasklists;
  payload: { tasklists: TTasklists };
};
export type TasklistAction = {
  type: add_tasklist | modify_tasklist | remove_tasklist;
  payload: { tasklist: ITasklist };
};

export type TaskAction = {
  type: add_task | remove_task | modify_task;
  payload: { tasklistID: string; task: ITask };
};

export type TaskStageAction = {
  type: restage_task;
  payload: {
    tasklistID: string;
    taskID: string;
    priority: number;
    oldPriority: number;
    stage: Stage;
    oldStage: Stage;
  };
};

export type TaskOrderAction = {
  type: reorder_task;
  payload: {
    tasklistID: string;
    taskID: string;
    stage: Stage;
    priority: number;
    oldPriority: number;
  };
};

export type UserAction = {
  type: update_user;
  payload: { user: IUserInfo };
};

export type AllTasklistActions = TasklistAction | TasklistsAction | TaskAction | TaskStageAction | TaskOrderAction;

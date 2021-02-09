import { Stage } from "./Constants";

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

export interface IUserInfo {
  icon: string;
  color: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

export interface ITasklistsHolder {
  tasklists: TTasklists;
  ids: IIDs;
};

// this has dynamically generated ids
// based on the tasklist ids and therefore
// can only be considered an object who's keys are
// numbers
export interface IIDs { [key: string]: number };

export type TTasklists = Array<ITasklist>;

export interface ITasklist {
  description: string;
  _id: string;
  name: string;
  tasks: TTasks;
  createdAt: Date;
  updatedAt: Date;
};

export type TTasks = Array<ITask>;

export interface ITask {
  assignedUsername: string;
  assignedUserIcon: string,
  description: string;
  stage: Stage;
  _id: string;
  name: string;
  due?: Date;
};

export type TasklistsAction = {
  type: replace_tasklists;
  payload: { tasklists: TTasklists };
};
export type TasklistAction = { type: add_tasklist | modify_tasklist | remove_tasklist; payload: { tasklist: ITasklist } };

export type TaskAction = {
  type: add_task | remove_task | modify_task;
  payload: { tasklistID: string; task: ITask };
};

export type UserAction = {
  type: update_user;
  payload: { user: IUserInfo };
}

export type AllTasklistActions = TasklistAction | TasklistsAction | TaskAction;

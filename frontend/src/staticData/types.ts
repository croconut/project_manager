import { Stage } from "./ModelConstants";

export const ADD_TASK = "ADD_TASK";
export const REMOVE_TASK = "REMOVE_TASK";
export const MODIFY_TASK = "MODIFY_TASK";
export const ADD_TASKLIST = "ADD_TASKLIST";
export const REMOVE_TASKLIST = "REMOVE_TASKLIST";
export const MODIFY_TASKLIST = "MODIFY_TASKLIST";
export const REPLACE_ALL_TASKLISTS = "REPLACE_ALL_TASKLISTS";
export const UPDATE_USER = "UPDATE_USER";

export interface UserInfo {
  icon: string;
  color: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  __v: Number;
};

export interface TasklistsHolder {
  tasklists: Tasklists;
  ids: IDs;
};

// this has dynamically generated ids
// based on the tasklist ids and therefore
// can only be considered an object who's keys are
// numbers
export interface IDs { [key: string]: Number };

export type Tasklists = Array<Tasklist>;

export interface Tasklist {
  description: string;
  _id: string;
  name: string;
  tasks: Tasks;
  createdAt: Date;
  updatedAt: Date;
};

export type Tasks = Array<Task>;

export interface Task {
  assignedUsername: string;
  description: string;
  stage: Stage;
  _id: string;
  name: string;
};

export type TasklistsAction = {
  type: string;
  payload: { tasklists: Tasklists };
};
export type TasklistAction = { type: string; payload: { tasklist: Tasklist } };
export type TaskAction = {
  type: string;
  payload: { tasklistID: string; task: Task };
};

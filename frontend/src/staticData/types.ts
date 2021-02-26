import {
  Stage,
  TRequestFail,
  TStatus,
  TUpdateFail,
} from "./Constants";

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
export const LOGIN_COMPLETE = "LOGIN_COMPLETE" as const;
type login_complete = typeof LOGIN_COMPLETE;
export const LOGOUT_COMPLETE = "LOGOUT_COMPLETE" as const;
type logout_complete = typeof LOGOUT_COMPLETE;
export const FETCH_FAILURE = "FETCH_FAILURE" as const;
type fetch_failure = typeof FETCH_FAILURE;
export const FETCHING_DATA = "FETCHING_DATA" as const;
type fetching = typeof FETCHING_DATA;
export const UPDATE_FAILURE = "UPDATE_FAILURE" as const;
type update_failure = typeof UPDATE_FAILURE;
export const UPDATING_SERVER = "UPDATING_SERVER" as const;
type updating = typeof UPDATING_SERVER;
export const TASKLIST_UPDATED = "TASKLIST_UPDATED" as const;
type tasklist_updated = typeof TASKLIST_UPDATED;

export interface IUserInfo {
  icon: string;
  color: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface ServerStatus {
  status: TStatus;
  lastFetchFailure: TRequestFail;
  lastUpdateFailure: TUpdateFail;
  loggedIn: boolean;
}

export enum UpdateType {
  // just the tasklist info that doesn't touch child models
  // like the tasks array
  TASKLIST_INFO,
  // the tasklist info and also the task array
  TASKLIST,
  // a single task in a tasklist
  TASK,
  // many tasks in a single tasklist
  TASK_MANY,
  // the top level user information that doesn't touch
  // child models like the tasklists array
  USER_INFO,
}

export interface IDChain {
  type: UpdateType;
  id: string;
  parentid?: string;
  // this one should always be "" rn
  gparentid?: string;
}

export interface StoreStatus {
  dirty: Array<IDChain>;
  updating: Array<IDChain>;
}

export type TUserCredentials = {
  password: string;
} & ({ username: string } | { email: string });

export interface IUserRegister {
  username: string;
  email: string;
  password: string;
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
  stage1: Array<number>;
  stage2: Array<number>;
  stage3: Array<number>;
  stage4: Array<number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITasklistStages {
  stage1?: Array<number>;
  stage2?: Array<number>;
  stage3?: Array<number>;
  stage4?: Array<number>;
}

export type TTasks = Array<ITask>;

export interface ITask {
  assignedUsername?: string;
  assignedUserIcon?: string;
  description: string;
  _id: string;
  name: string;
  due?: Date;
}

export const extractUserInfo = (info: any): IUserInfo | null => {
  if (!isUserInfo(info)) {
    return null;
  }
  return {
    __v: info.__v,
    icon: info.icon,
    color: info.color,
    email: info.email,
    username: info.username,
    createdAt: info.createdAt,
    updatedAt: info.updatedAt,
  };
};

export const extractTasklists = (info: any): TTasklists | null => {
  if (!isTasklists(info?.tasklists)) {
    return null;
  }
  return info.tasklists;
};

export const extractTasklist = (info: any): ITasklist | null => {
  if (!isTasklist(info.tasklist)) {
    return null;
  }
  return info.tasklist;
};

export const isUserInfo = (info: any): info is IUserInfo => {
  if (info === null || typeof info !== "object") return false;
  const infoParsed = info as IUserInfo;
  return (
    typeof infoParsed.__v === "number" &&
    typeof infoParsed.color === "string" &&
    typeof infoParsed.createdAt === "string" &&
    typeof infoParsed.email === "string" &&
    typeof infoParsed.icon === "string" &&
    typeof infoParsed.updatedAt === "string" &&
    typeof infoParsed.username === "string"
  );
};

// these typeguards should only be necessary for server updates
export const isTasklists = (lists: any): lists is TTasklists => {
  return Array.isArray(lists) && lists.every((e) => isTasklist(e));
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
    isStage(tasklist.stage1) &&
    isStage(tasklist.stage2) &&
    isStage(tasklist.stage3) &&
    isStage(tasklist.stage4) &&
    isTasks(tasklist.tasks)
  );
};

export const isStage = (stage: any): stage is Array<number> => {
  return Array.isArray(stage) && stage.every((e) => typeof e === "number");
};

export const isTasks = (tasks: any): tasks is TTasks => {
  return Array.isArray(tasks) && tasks.every((e) => isTask(e));
};

export const isTask = (obj: any): obj is ITask => {
  // null is an object for some reason
  if (obj === null || typeof obj !== "object") return false;
  const task = obj as ITask;
  return (
    task._id !== undefined &&
    task.description !== undefined &&
    task.name !== undefined
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

export type FetchFailedAction = {
  type: fetch_failure;
  payload: {
    reason: TRequestFail;
  };
};

export type UpdateFailedAction = {
  type: update_failure;
  payload: {
    reason: TUpdateFail;
  };
};

export type UserAction = {
  type: update_user;
  payload: { user: IUserInfo };
};

export type LoginCompleteAction = {
  type: login_complete;
  payload: { user: IUserInfo; tasklists: TTasklists };
};

export type LogoutCompleteAction = {
  type: logout_complete;
};

export type TasklistUpdatedAction = {
  type: tasklist_updated;
  payload: { tasklist: ITasklist };
};

export type FetchAction = {
  type: fetching;
};

export type UpdateAction = {
  type: updating;
};

export interface LoginReturn {
  userInfo: IUserInfo;
  tasklists: TTasklists;
}

export interface TasklistReturn {
  tasklist: ITasklist;
}

export type AnyCustomAction =
  | UserAction
  | TasklistAction
  | TasklistsAction
  | TaskAction
  | TaskStageAction
  | TaskOrderAction
  | UpdateAction
  | UpdateFailedAction
  | FetchAction
  | FetchFailedAction
  | LoginCompleteAction
  | LogoutCompleteAction
  | TasklistUpdatedAction;

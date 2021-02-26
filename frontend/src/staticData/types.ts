import { Stage, TRequestFail, TStatus, TUpdateFail } from "./Constants";

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

export interface ITimestamp {
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IObjectID {
  _id: string;
}

export interface IVersion {
  __v: number;
}

// btw, icon should be a number which is used to select an icon, in range of my icon set's size
export interface IUserModdableInfo {
  icon: string;
  color: string;
  username: string;
  email: string;
}

export interface IUserInfo extends IUserModdableInfo, ITimestamp, IVersion {}

export interface ServerStatus {
  status: TStatus;
  lastFetchFailure: TRequestFail;
  lastUpdateFailure: TUpdateFail;
  loggedIn: boolean;
}

export enum UpdateType {
  TASKLIST_INFO,
  TASKS,
  STAGES,
  USER_INFO,
}

// for tasklist, it says what parts need to be updated basically
// each entry will add another thing, if user_info is also stated
// means nothing
// user_info is only for user profile updates (color / icon / whatever's changeable on userinfo)
export interface IDChain {
  type: Array<UpdateType>;
  // set this when the request starts getting pushed
  // create and add idchain when request becomes needed
  // if
  updating: boolean;
}

// key is the url extension required to reach this update
// aka will be one objectid for everything currently (the tasklist)
// or the userid (user based updates will ignore this url ofc)

// when requesting to add a tasklist, fake uuid will be replaced with
// real one on update complete and the tasklist will be removed from store status
// iteratively checking "ntl1", then "ntl2" etc to see which is in process of updating
// and removing first found that is updating still
export interface StoreStatus {
  [key: string]: IDChain;
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

export interface ITasklistStages {
  stage1: Array<number>;
  stage2: Array<number>;
  stage3: Array<number>;
  stage4: Array<number>;
}

export interface ITasklist extends ITasklistStages, ITimestamp, IObjectID {
  description: string;
  name: string;
  tasks: TTasks;
}

export interface ITasklistPartialStages {
  stage1?: Array<number>;
  stage2?: Array<number>;
  stage3?: Array<number>;
  stage4?: Array<number>;
}

export interface ITasklistUpdate extends IObjectID {
  description?: string;
  name?: string;
  tasks?: TTasks;
  stages?: ITasklistStages;
  // for when the stages changed but the tasks didnt
  taskslength?: number;
}

// looks similar to ITasklistUpdate, but they are very definitely not
// interchangeable
export interface ITasklistCreate {
  description: string;
  name: string;
  // tasks, stages and description can be empty, name cannot
  tasks: TTasks;
  stages: ITasklistStages;
}

export type TTasks = Array<ITask>;

export interface ITask extends IObjectID {
  assignedUsername: string;
  assignedUserIcon: string;
  description: string;
  name: string;
  due?: Date | string;
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
    typeof tasklist.createdAt === "string" &&
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
    typeof task._id === "string" &&
    typeof task.description === "string" &&
    typeof task.name === "string" &&
    typeof task.assignedUserIcon === "string" &&
    typeof task.assignedUsername === "string"
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

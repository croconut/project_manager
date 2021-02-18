import axios from "axios";
import { ThunkDispatch, ThunkAction } from "redux-thunk";
import { RequestFails, Stage, TRequestFail } from "src/staticData/Constants";
import { loginRouter, usersPrivateInfo } from "src/staticData/Routes";
import * as types from "../staticData/types";

export const updateTasklistsFromServer = (
  tasklists: types.TTasklists
): types.TasklistsAction => ({
  type: types.REPLACE_ALL_TASKLISTS,
  payload: {
    tasklists: tasklists,
  },
});

export const modifyTasklist = (
  tasklist: types.ITasklist
): types.TasklistAction => ({
  type: types.MODIFY_TASKLIST,
  payload: {
    tasklist: tasklist,
  },
});

export const addTasklist = (
  tasklist: types.ITasklist
): types.TasklistAction => ({
  type: types.ADD_TASKLIST,
  payload: {
    tasklist: tasklist,
  },
});

export const removeTasklist = (
  tasklist: types.ITasklist
): types.TasklistAction => ({
  type: types.REMOVE_TASKLIST,
  payload: {
    tasklist: tasklist,
  },
});

export const addTask = (
  tasklistID: string,
  task: types.ITask
): types.TaskAction => ({
  type: types.ADD_TASK,
  payload: {
    tasklistID: tasklistID,
    task: task,
  },
});

export const modifyTask = (
  tasklistID: string,
  task: types.ITask
): types.TaskAction => ({
  type: types.MODIFY_TASK,
  payload: {
    tasklistID: tasklistID,
    task: task,
  },
});

export const removeTask = (
  tasklistID: string,
  task: types.ITask
): types.TaskAction => ({
  type: types.REMOVE_TASK,
  payload: {
    tasklistID: tasklistID,
    task: task,
  },
});

export const restageTask = (
  tasklistID: string,
  taskID: string,
  stage: Stage,
  oldStage: Stage,
  priority: number,
  oldPriority: number
): types.TaskStageAction => ({
  type: types.RESTAGE_TASK,
  payload: {
    tasklistID,
    taskID,
    stage,
    priority,
    oldStage,
    oldPriority,
  },
});

export const reorderTask = (
  tasklistID: string,
  taskID: string,
  stage: Stage,
  priority: number,
  oldPriority: number
): types.TaskOrderAction => ({
  type: types.REORDER_TASK,
  payload: {
    tasklistID,
    taskID,
    stage,
    priority,
    oldPriority,
  },
});

export const loginFail = (reason: TRequestFail): types.FailedFetchAction => ({
  type: types.LOGIN_FAILURE,
  payload: {
    reason,
  },
});

export const loginSuccess = (
  login: types.LoginReturn
): types.LoginCompleteAction => ({
  type: types.LOGIN_COMPLETE,
  payload: {
    user: login.userInfo,
    tasklists: login.tasklists,
  },
});

const loginRequest = async (
  credentials: types.IUserCredentials
): Promise<types.LoginReturn> => {
  const loginRes = await axios.post(loginRouter.route, credentials);
  if (loginRes.status >= 300) {
    return Promise.reject(RequestFails[0]);
  }
  return await infoRequest();
};

const infoRequest = async (): Promise<types.LoginReturn> => {
  const infoRes = await axios.get(usersPrivateInfo.route, {
    withCredentials: true,
  });
  if (infoRes.status >= 300) {
    return Promise.reject(RequestFails[1]);
  }
  const user = types.extractUserInfo(infoRes.data);
  if (user === null) {
    return Promise.reject(RequestFails[2]);
  }
  const tasklists = types.extractTasklists(infoRes.data);
  if (tasklists === null) {
    return Promise.reject(RequestFails[3]);
  }
  return { userInfo: user, tasklists: tasklists };
};

// thunks
// NOTE on return type of these thunks
// use the top level argument types and the return type of the last function
export const loginAttempt = (
  credentials: types.IUserCredentials
): ThunkAction<
  Promise<types.FailedFetchAction | types.LoginCompleteAction>,
  {},
  {},
  types.LoginCompleteAction | types.FailedFetchAction
> => {
  return function (
    dispatch: ThunkDispatch<
      {},
      {},
      types.LoginCompleteAction | types.FailedFetchAction
    >
  ) {
    return loginRequest(credentials).then(
      (login: types.LoginReturn) => dispatch(loginSuccess(login)),
      (reason: TRequestFail) => dispatch(loginFail(reason))
    );
  };
};

// TODO slightly truncated version of login
export const loginAttemptFromCookie = (): ThunkAction<
  Promise<types.FailedFetchAction | types.LoginCompleteAction>,
  {},
  {},
  types.LoginCompleteAction | types.FailedFetchAction
> => {
  return function (
    dispatch: ThunkDispatch<
      {},
      {},
      types.LoginCompleteAction | types.FailedFetchAction
    >
  ) {
    return infoRequest().then(
      (login: types.LoginReturn) => dispatch(loginSuccess(login)),
      (reason: TRequestFail) => dispatch(loginFail(reason))
    );
  };
};

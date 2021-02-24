import axios, { AxiosResponse, AxiosStatic } from "axios";
import { ThunkDispatch, ThunkAction } from "redux-thunk";
import {
  RequestFails,
  Stage,
  TRequestFail,
  TUpdateFail,
  UpdateFails,
} from "src/staticData/Constants";
import {
  loginRouter,
  logoutRouter,
  registerRouter,
  setTasks,
  usersPrivateInfo,
} from "src/staticData/Routes";
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

export const fetching = (): types.FetchAction => ({
  type: types.FETCHING_DATA,
});

export const updating = (): types.UpdateAction => ({
  type: types.UPDATING_SERVER,
});

export const updateUser = (info: types.IUserInfo): types.UserAction => ({
  type: types.UPDATE_USER,
  payload: {
    user: info,
  },
});

export const loginFail = (reason: TRequestFail): types.FetchFailedAction => ({
  type: types.FETCH_FAILURE,
  payload: {
    reason,
  },
});

export const updateFail = (reason: TUpdateFail): types.UpdateFailedAction => ({
  type: types.UPDATE_FAILURE,
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

export const logoutSuccess = (): types.LogoutCompleteAction => ({
  type: types.LOGOUT_COMPLETE,
});

export const tasklistUpdateSuccess = (
  obj: types.TasklistReturn
): types.TasklistUpdatedAction => ({
  type: types.TASKLIST_UPDATED,
  payload: {
    tasklist: obj.tasklist,
  },
});

interface ErrorResponse {
  response: AxiosResponse;
}

const extractPrivateInfo = (info: any) => {
  const user = types.extractUserInfo(info);
  if (user === null) {
    return Promise.reject(RequestFails[1]);
  }
  const tasklists = types.extractTasklists(info);
  if (tasklists === null) {
    return Promise.reject(RequestFails[2]);
  }
  return { userInfo: user, tasklists: tasklists };
};

const extractTasklist = (info: any): Promise<types.TasklistReturn> => {
  const tasklist = types.extractTasklist(info);
  if (tasklist === null) {
    return Promise.reject(UpdateFails[1]);
  }
  return Promise.resolve({ tasklist: tasklist });
}

const setTasksRequest = (tasks: types.TTasks): Promise<types.TasklistReturn> => {
  return axios
    .post(setTasks.route, { tasks: tasks }, { withCredentials: true })
    .then((response) => extractTasklist(response.data))
    .catch(({ response }: ErrorResponse) => Promise.reject(UpdateFails[2]));
};

const loginRequest = (
  credentials: types.TUserCredentials
): Promise<types.LoginReturn> => {
  return axios
    .post(loginRouter.route, credentials)
    .then((response) => extractPrivateInfo(response.data.user))
    .catch(({ response }: ErrorResponse) => Promise.reject(RequestFails[0]));
};

const logoutRequest = (): Promise<AxiosStatic> => {
  return axios.post(logoutRouter.route, { withCredentials: true });
};

const signupRequest = (
  credentials: types.IUserRegister
): Promise<types.LoginReturn> => {
  return axios
    .post(registerRouter.route, credentials)
    .then((response) => extractPrivateInfo(response.data.user))
    .catch(({ response }: ErrorResponse) => {
      if (response === undefined) {
        return Promise.reject(RequestFails[7]);
      }
      if (response.status !== 409) {
        return Promise.reject(RequestFails[7]);
      }
      if (response.data.username) {
        if (response.data.email) {
          return Promise.reject(RequestFails[5]);
        } else {
          return Promise.reject(RequestFails[4]);
        }
      } else if (response.data.email) {
        return Promise.reject(RequestFails[3]);
      }
      return Promise.reject(RequestFails[7]);
    });
};

const infoRequest = (cookieLogin = false): Promise<types.LoginReturn> => {
  return axios
    .get(usersPrivateInfo.route, {
      withCredentials: true,
    })
    .then((response) => extractPrivateInfo(response.data))
    .catch(({ response }: ErrorResponse) => {
      if (cookieLogin) return Promise.reject(RequestFails[9]);
      else return Promise.reject(RequestFails[6]);
    });
};

// thunks
// NOTE on return type of these thunks
// use the top level argument types and the return type of the last function
export const loginAttempt = (
  credentials: types.TUserCredentials
): ThunkAction<
  Promise<types.FetchFailedAction | types.LoginCompleteAction>,
  {},
  {},
  types.AnyCustomAction
> => {
  return function (dispatch: ThunkDispatch<{}, {}, types.AnyCustomAction>) {
    dispatch(fetching());
    return loginRequest(credentials)
      .then((login: types.LoginReturn) => dispatch(loginSuccess(login)))
      .catch((reason: TRequestFail) => dispatch(loginFail(reason)));
  };
};

// TODO slightly truncated version of login
export const loginAttemptFromCookie = (): ThunkAction<
  Promise<types.FetchFailedAction | types.LoginCompleteAction>,
  {},
  {},
  types.AnyCustomAction
> => {
  return function (dispatch: ThunkDispatch<{}, {}, types.AnyCustomAction>) {
    dispatch(fetching());
    return infoRequest(true)
      .then((login: types.LoginReturn) => dispatch(loginSuccess(login)))
      .catch((reason: TRequestFail) => dispatch(loginFail(reason)));
  };
};

export const signUpAttempt = (
  credentials: types.IUserRegister
): ThunkAction<
  Promise<types.FetchFailedAction | types.LoginCompleteAction>,
  {},
  {},
  types.AnyCustomAction
> => {
  return function (dispatch: ThunkDispatch<{}, {}, types.AnyCustomAction>) {
    dispatch(fetching());
    return signupRequest(credentials)
      .then((login: types.LoginReturn) => dispatch(loginSuccess(login)))
      .catch((reason: TRequestFail) => dispatch(loginFail(reason)));
  };
};

export const logoutAttempt = (): ThunkAction<
  Promise<types.UpdateFailedAction | types.LogoutCompleteAction>,
  {},
  {},
  types.AnyCustomAction
> => {
  return function (dispatch: ThunkDispatch<{}, {}, types.AnyCustomAction>) {
    dispatch(fetching());
    return logoutRequest()
      .then(() => dispatch(logoutSuccess()))
      .catch(() => dispatch(updateFail(UpdateFails[0])));
  };
};

export const setTasksAttempt = (
  tasks: types.TTasks
): ThunkAction<
  Promise<types.UpdateFailedAction | types.TasklistUpdatedAction>,
  {},
  {},
  types.AnyCustomAction
> => {
  return function (dispatch: ThunkDispatch<{}, {}, types.AnyCustomAction>) {
    dispatch(updating());
    return setTasksRequest(tasks)
      .then((tasklistObj: types.TasklistReturn) =>
        dispatch(tasklistUpdateSuccess(tasklistObj))
      )
      .catch((reason: TUpdateFail) => dispatch(updateFail(reason)));
  };
};

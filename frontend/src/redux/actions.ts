import axios, { AxiosResponse, AxiosStatic } from "axios";
import { ThunkDispatch, ThunkAction } from "redux-thunk";
import {
  ID_ADDITION,
  RequestFails,
  Stage,
  TRequestFail,
  TUpdateFail,
  UpdateFails,
} from "src/staticData/Constants";
import {
  loginRouter,
  logoutRouter,
  addTasklist as addTasklistRouter,
  registerRouter,
  updateTasklist,
  usersPrivateInfo,
  deleteTasklist,
} from "src/staticData/Routes";
import * as types from "../staticData/types";
import { RootStore } from "./configureStore";
import { RootState } from "./reducers";

export const modifyTasklist = (
  tasklist: types.ITasklist
): types.TasklistAction => ({
  type: types.MODIFY_TASKLIST,
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

export const fetching = (_id: string): types.FetchAction => ({
  type: types.FETCHING_DATA,
  payload: { _id },
});

export const updating = (_id: string): types.UpdateAction => ({
  type: types.UPDATING_SERVER,
  payload: { _id },
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

export const updateFail = (
  reason: TUpdateFail,
  id = ""
): types.UpdateFailedAction => ({
  type: types.UPDATE_FAILURE,
  payload: {
    reason,
    _id: id,
  },
});

export const loginSuccess = (
  login: types.ILoginReturn
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
  obj: types.ITasklistReturn,
  state: RootState
): types.TasklistUpdatedAction => {
  return {
    type: types.TASKLIST_UPDATED,
    payload: {
      tasklist: obj.tasklist,
      waitingNext:
        state.storeState[`${obj.tasklist._id}${ID_ADDITION}`] !== undefined,
    },
  };
};

export const tasklistDeleteSuccess = (
  id: string
): types.TasklistDeleteAction => {
  return {
    type: types.REMOVE_TASKLIST,
    payload: {
      tasklistID: id,
    },
  };
};

export const tasklistCreateSuccess = (
  obj: types.ITasklistReturn
): types.TasklistCreatedAction => ({
  type: types.TASKLIST_CREATED,
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

const extractTasklist = (info: any): Promise<types.ITasklistReturn> => {
  const tasklist = types.extractTasklist(info);
  if (tasklist === null) {
    return Promise.reject(UpdateFails[1]);
  }
  return Promise.resolve({ tasklist: tasklist });
};

const updateTasklistRequest = async (
  tasklist: types.IParsedUpdate
): Promise<types.ITasklistReturn> => {
  try {
    const response = await axios
      .post(
        updateTasklist.route + tasklist._id,
        // server doesn't care about extra stuff like having the _id here :p
        // it extracts the info it wants
        tasklist,
        { withCredentials: true }
      );
    return await extractTasklist(response.data);
  } catch ({ response: response_1 }) {
    console.warn(response_1.data);
    return await Promise.reject(UpdateFails[1]);
  }
};

const addTasklistRequest = async (
  tasklist: types.ITasklistCreate
): Promise<types.ITasklistReturn> => {
  try {
    const response = await axios
      .post(addTasklistRouter.route, tasklist, { withCredentials: true });
    return await extractTasklist(response.data);
  } catch ({ response: response_1 }) {
    return await Promise.reject(UpdateFails[1]);
  }
};

const deleteTasklistRequest = (id: string): Promise<void> => {
  return (
    axios
      .delete(deleteTasklist.route + id, { withCredentials: true })
      .then(() => {})
      // at some point need to parse this and get better rejection information
      .catch(({ response }: ErrorResponse) => Promise.reject(UpdateFails[1]))
  );
};

const loginRequest = async (
  credentials: types.TUserCredentials
): Promise<types.ILoginReturn> => {
  try {
    const response = await axios
      .post(loginRouter.route, credentials);
    return extractPrivateInfo(response.data.user);
  } catch ({ response: response_1 }) {
    if (response_1.status === 429)
      return Promise.reject(RequestFails[11]);
    else
      return Promise.reject(RequestFails[0]);
  }
};

const logoutRequest = (): Promise<AxiosStatic> => {
  return axios.post(logoutRouter.route, { withCredentials: true });
};

const signupRequest = async (
  credentials: types.IUserRegister
): Promise<types.ILoginReturn> => {
  try {
    const response = await axios
      .post(registerRouter.route, credentials);
    return extractPrivateInfo(response.data.user);
  } catch ({ response: response_1 }) {
    if (response_1 === undefined) {
      return Promise.reject(RequestFails[7]);
    }
    if (response_1.status !== 409) {
      return Promise.reject(RequestFails[7]);
    }
    if (response_1.data.username) {
      if (response_1.data.email) {
        return Promise.reject(RequestFails[5]);
      } else {
        return Promise.reject(RequestFails[4]);
      }
    } else if (response_1.data.email) {
      return Promise.reject(RequestFails[3]);
    }
    return await Promise.reject(RequestFails[7]);
  }
};

const infoRequest = async (cookieLogin = false): Promise<types.ILoginReturn> => {
  try {
    const response = await axios
      .get(usersPrivateInfo.route, {
        withCredentials: true,
      });
    return extractPrivateInfo(response.data);
  } catch ({ response: response_1 }) {
    if (cookieLogin)
      return Promise.reject(RequestFails[9]);
    else
      return Promise.reject(RequestFails[6]);
  }
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
  return async function (dispatch: ThunkDispatch<{}, {}, types.AnyCustomAction>) {
    dispatch(fetching(types.FAKE_IDS[0]));
    return await loginRequest(credentials)
      .then((login: types.ILoginReturn) => dispatch(loginSuccess(login)))
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
  return async function (dispatch: ThunkDispatch<{}, {}, types.AnyCustomAction>) {
    dispatch(fetching(types.FAKE_IDS[0]));
    return await infoRequest(true)
      .then((login: types.ILoginReturn) => dispatch(loginSuccess(login)))
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
  return async function (dispatch: ThunkDispatch<{}, {}, types.AnyCustomAction>) {
    dispatch(fetching(types.FAKE_IDS[0]));
    return await signupRequest(credentials)
      .then((login: types.ILoginReturn) => dispatch(loginSuccess(login)))
      .catch((reason: TRequestFail) => dispatch(loginFail(reason)));
  };
};

export const logoutAttempt = (): ThunkAction<
  Promise<types.UpdateFailedAction | types.LogoutCompleteAction>,
  {},
  {},
  types.AnyCustomAction
> => {
  return async function (dispatch: ThunkDispatch<{}, {}, types.AnyCustomAction>) {
    dispatch(fetching(types.FAKE_IDS[0]));
    return await logoutRequest()
      .then(() => dispatch(logoutSuccess()))
      .catch(() => dispatch(updateFail(UpdateFails[0])));
  };
};

export const addTasklistAttempt = (
  tasklist: types.ITasklistCreate
): ThunkAction<
  Promise<types.UpdateFailedAction | types.TasklistCreatedAction>,
  {},
  {},
  types.AnyCustomAction
> => {
  return async function (dispatch: ThunkDispatch<{}, {}, types.AnyCustomAction>) {
    dispatch(updating(types.FAKE_IDS[1]));
    return await addTasklistRequest(tasklist)
      .then((tasklistObj: types.ITasklistReturn) =>
        dispatch(tasklistCreateSuccess(tasklistObj))
      )
      .catch((reason: TUpdateFail) => dispatch(updateFail(reason)));
  };
};

export const updateTasklistAttempt = (
  tasklist: types.IParsedUpdate,
  store: RootStore
): ThunkAction<
  Promise<types.UpdateFailedAction | types.TasklistUpdatedAction>,
  {},
  {},
  types.AnyCustomAction
> => {
  return async function (dispatch: ThunkDispatch<{}, {}, types.AnyCustomAction>) {
    const id = tasklist._id;
    store.dispatch(updating(tasklist._id));
    return await updateTasklistRequest(tasklist)
      .then((tasklistObj: types.ITasklistReturn) =>
        store.dispatch(tasklistUpdateSuccess(tasklistObj, store.getState()))
      )
      .catch((reason: TUpdateFail) => store.dispatch(updateFail(reason, id)));
  };
};

export const deleteTasklistAttempt = (
  id: string
): ThunkAction<
  Promise<types.UpdateFailedAction | types.TasklistDeleteAction>,
  {},
  {},
  types.AnyCustomAction
> => {
  return async function (dispatch: ThunkDispatch<{}, {}, types.AnyCustomAction>) {
    dispatch(updating(id));
    return await deleteTasklistRequest(id)
      .then(() => dispatch(tasklistDeleteSuccess(id)))
      .catch((reason: TUpdateFail) => dispatch(updateFail(reason, id)));
  };
};

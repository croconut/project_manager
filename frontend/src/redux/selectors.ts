import { Stage, TaskStage } from "src/staticData/Constants";
import { ITask, ITasklist, TTasks } from "src/staticData/types";
import { RootState } from "./reducers";

export const getTasklists = (state: RootState) =>
  state.tasklistHolder.tasklists;
export const getTasklistIDS = (state: RootState) => state.tasklistHolder.ids;

interface NameProps {
  name: string;
}
interface IndexProps {
  index: number;
}
interface IDProps {
  id: string;
}

export const getTasklistByName = (state: RootState, props: NameProps) => {
  var tasklists = getTasklists(state);
  // this check is like entirely unnecessary
  for (let i = 0; i < tasklists.length; i++) {
    if (tasklists[i].name === props.name) {
      return tasklists[i];
    }
  }
  return null;
};

export const getTasklistByIndex = (state: RootState, props: IndexProps) => {
  var tasklists = getTasklists(state);
  if (tasklists.length <= props.index || props.index < 0) return null;
  return tasklists[props.index];
};

// note: it's .id not ._id here
export const getTasklistById = (state: RootState, props: IDProps) => {
  var tasklists = getTasklists(state);
  var ids = getTasklistIDS(state);
  const id = ids[props.id];
  if (id === undefined || id < 0 || id >= tasklists.length) return null;
  return tasklists[id];
};

export const getLoggedIn = (state: RootState) => {
  return state.serverState.loggedIn;
};

export const getStoreStatus = (state: RootState) => {
  return state.serverState.status;
}

export const getLastFetchFailure = (state: RootState) => {
  return state.serverState.lastFetchFailure;
}

export const getLastUpdateFailure = (state: RootState) => {
  return state.serverState.lastUpdateFailure;
}

// only really for extracting one tasklist if only one is needed
// 0 - TaskStage.length, refer to the types inside it e.g. ongoing or todo
export const extractTasksByType = (tasks: TTasks, type: number) => {
  const newNum = Math.max(Math.min(type, TaskStage.length), 0);
  return tasks.filter((item) => item.stage === TaskStage[newNum]);
};

// requires knowledge of taskstage's length
// last array is reserved for items that weren't in the taskstage array
export const getTasksSplitByStageID = (state: RootState, props: IDProps) => {
  const tasklist = getTasklistById(state, props);
  if (tasklist === null) return null;
  return separateTasksByType(tasklist);
};

export const separateTasksByType = (tasklist: ITasklist) => {
  const twoDArr = new Array<Array<ITask>>(TaskStage.length + 1);
  for (let i = 0; i < twoDArr.length; i++) {
    twoDArr[i] = [];
  }
  tasklist.stage1.forEach((element) => twoDArr[0].push(tasklist.tasks[element]));
  tasklist.stage2.forEach((element) => twoDArr[1].push(tasklist.tasks[element]));
  tasklist.stage3.forEach((element) => twoDArr[2].push(tasklist.tasks[element]));
  tasklist.stage4.forEach((element) => twoDArr[3].push(tasklist.tasks[element]));
  return twoDArr;
};

// todo after userinfo reducer created
// export const getUserInfo = (state: RootState) => .state.userInfo;

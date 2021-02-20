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

export const getLastFailure = (state: RootState) => {
  return state.serverState.lastFailure;
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
  return separateTasksByType(tasklist.tasks);
};

export const getTasksSplitByStageIndex = (
  state: RootState,
  props: IndexProps
) => {
  const tasklist = getTasklistByIndex(state, props);
  if (tasklist === null) return null;
  return separateTasksByType(tasklist.tasks);
};

export const getTaskStageCountsByID = (state: RootState, props: IDProps) => {
  const tasklist = getTasklistById(state, props);
  if (tasklist === null) return null;
  return getTaskStageCounts(tasklist.tasks);
};

export const getTaskStageCountsByIndex = (
  state: RootState,
  props: IndexProps
) => {
  const tasklist = getTasklistByIndex(state, props);
  if (tasklist === null) return null;
  return getTaskStageCounts(tasklist.tasks);
};

export const getStageCount = (tasklist: ITasklist, stage: Stage) => {
  return tasklist.tasks.reduce(
    (sum, task) => (task.stage === stage ? sum + 1 : sum),
    0
  );
};

// also requires knowledge of length of TaskStage
export const getTaskStageCounts = (tasks: TTasks) => {
  const counts = new Array<number>(TaskStage.length + 1);
  for (let i = 0; i < TaskStage.length; i++) {
    counts[i] = 0;
  }
  for (let i = 0; i < tasks.length; i++) {
    let inserted = false;
    let stage = tasks[i].stage;
    for (let j = 0; j < TaskStage.length; j++) {
      if (stage === TaskStage[j]) {
        counts[j]++;
        // basically a break
        j = TaskStage.length;
        inserted = true;
      }
    }
    if (!inserted) {
      counts[TaskStage.length]++;
    }
  }
  return counts;
};

export const separateTasksByType = (tasks: TTasks) => {
  const twoDArr = new Array<Array<ITask>>(TaskStage.length + 1);
  for (let i = 0; i < twoDArr.length; i++) {
    twoDArr[i] = [];
  }
  for (let i = 0; i < tasks.length; i++) {
    let inserted = false;
    let task = tasks[i];
    let stage = tasks[i].stage;
    for (let j = 0; j < TaskStage.length; j++) {
      if (stage === TaskStage[j]) {
        twoDArr[j].push(task);
        j = TaskStage.length;
        inserted = true;
      }
    }
    if (!inserted) {
      twoDArr[TaskStage.length].push(task);
    }
  }
  return twoDArr;
};

export const sortAlreadySeparatedTasks = (tasks: TTasks) => {
  return tasks.sort((a, b) => a.priority - b.priority);
};

// todo after userinfo reducer created
// export const getUserInfo = (state: RootState) => .state.userInfo;

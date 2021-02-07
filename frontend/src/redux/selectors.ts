// IMPORTANT none of these objects are being FROZEN
// INSTEAD the actual state will only be mutated when the MODIFY action is called
// since the selectors only return full copies (assumes no nested objects, arrays are known
// and each is spread)

import { RootState } from "./reducers";

// internal functions, do not export selectors that aren't giving deep copies
export const getTasklists = (state: RootState) => state.tasklistHolder.tasklists;
export const getTasklistIDS = (state: RootState) => state.tasklistHolder.ids;

interface NameProps { name: string };
interface IndexProps { index: number };
interface IDProps { id: string };

export const getTasklistByName = (state: RootState, props: NameProps) => {
  var tasklists = getTasklists(state);
  if (!tasklists) return undefined;
  for (let i = 0; i < tasklists.length; i++) {
    if (tasklists[i].name === props.name) {
      let tasks = tasklists[i].tasks;
      let taskCopy = new Array(tasks.length);
      for (let j = 0; j < tasks.length; j++) {
        // tasks are flat objects, shallow is best
        taskCopy[j] = { ...tasks[j] };
      }
      return { ...tasklists[i], ...{ tasks: taskCopy } };
    }
  }
  return undefined;
};

export const getTasklistByIndex = (state: RootState, props: IndexProps) => {
  var tasklists = getTasklists(state);
  if (!tasklists) return undefined;
  if (tasklists.length <= props.index) return undefined;
  let tasks = tasklists[props.index].tasks;
  let taskCopy = new Array(tasks.length);
  for (let j = 0; j < tasks.length; j++) {
    // tasks are flat objects, shallow is best
    taskCopy[j] = { ...tasks[j] };
  }
  // other than tasks, tasklist is shallow object
  return { ...tasklists[props.index], ...{ tasks: taskCopy } };
};

// note: it's .id not ._id here
export const getTasklistById = (state: RootState, props: IDProps) => {
  var tasklists = getTasklists(state);
  var ids = getTasklistIDS(state);
  const id = ids[props.id];
  if (!id && id !== 0)
    return undefined;
  return tasklists[ids[props.id]];
};

// todo after userinfo reducer created
// export const getUserInfo = (state: RootState) => ({ ...state.userInfo });

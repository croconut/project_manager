import { RootState } from "./reducers";

export const getTasklists = (state: RootState) => state.tasklistHolder.tasklists;
export const getTasklistIDS = (state: RootState) => state.tasklistHolder.ids;

interface NameProps { name: string };
interface IndexProps { index: number };
interface IDProps { id: string };

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
  if (id === undefined || id < 0 || id >= tasklists.length)
    return null;
  return tasklists[id];
};

// TODO when userinfo gets updated from default, update this :x
export const getLoggedIn = (state: RootState) => {
  return state.tasklistHolder.tasklists.length > 0 && state.tasklistHolder.tasklists[0]._id.search("RANDOM") === -1;
}


// todo after userinfo reducer created
// export const getUserInfo = (state: RootState) => .state.userInfo;

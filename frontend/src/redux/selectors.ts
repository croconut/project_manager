import { RootState } from "./reducers";

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
      return tasklists[i];
    }
  }
  return undefined;
};

export const getTasklistByIndex = (state: RootState, props: IndexProps) => {
  var tasklists = getTasklists(state);
  if (!tasklists) return undefined;
  if (tasklists.length <= props.index) return undefined;
  return tasklists[props.index];
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

import { TasklistsHolder } from "../staticData/types";
import { RootState } from "./reducers";

const FreezeState = (state: RootState) => {
  FreezeTasklists(state.tasklistHolder);

  Object.freeze(state);
};

export const FreezeTasklists = (holder: TasklistsHolder) => {
  for (let i = 0; i < holder.tasklists.length; i++) {
    for (let j = 0; j < holder.tasklists[i].tasks.length; i++) {
      Object.freeze(holder.tasklists[i].tasks[j]);
    }
    Object.freeze(holder.tasklists[i]);
  }
  Object.freeze(holder.ids);
};

export default FreezeState;

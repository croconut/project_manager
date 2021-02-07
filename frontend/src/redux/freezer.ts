import { Middleware } from "redux";
import { AllTasklistActions, ITasklistsHolder } from "../staticData/types";
import { RootState } from "./reducers";

export const FreezeState = (state: RootState): RootState => {
  FreezeTasklistsHolder(state.tasklistHolder);
  Object.freeze(state);
  return state;
};

export const FreezeTasklistsHolder = (
  holder: ITasklistsHolder
): ITasklistsHolder => {
  for (let i = 0; i < holder.tasklists.length; i++) {
    for (let j = 0; j < holder.tasklists[i].tasks.length; j++) {
      Object.freeze(holder.tasklists[i].tasks[j]);
    }
    Object.freeze(holder.tasklists[i]);
  }
  Object.freeze(holder.ids);
  return holder;
};

export const Freezer: Middleware = (store: any) => (next: Function) => (
  action: AllTasklistActions
) => {
  // lets action happen and any other middleware
  next(action);
  // freezes the state
  FreezeState(store.getState());
};

export default Freezer;

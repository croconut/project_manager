import { AnyCustomAction, ITasklistsHolder, ServerStatus } from "src/staticData/types";
import { RootReducer, RootState } from "./reducers";

export const FreezeState = (state: RootState): RootState => {
  TasklistsHelper(state.tasklistHolder);
  ServerStateHelper(state.serverState);
  Object.freeze(state);
  return state;
};

const TasklistsHelper = (
  holder: ITasklistsHolder
): ITasklistsHolder => {
  if (holder === undefined) return holder;
  for (let i = 0; i < holder.tasklists.length; i++) {
    for (let j = 0; j < holder.tasklists[i].tasks.length; j++) {
      Object.freeze(holder.tasklists[i].tasks[j]);
    }
    Object.freeze(holder.tasklists[i].tasks);
    Object.freeze(holder.tasklists[i]);
  }
  Object.freeze(holder.ids);
  return holder;
};

const ServerStateHelper = (serverState: ServerStatus) => {
  if (serverState === undefined) return serverState;
  Object.freeze(serverState);
  return serverState;
}

// middleware wont work for state freezing
export function Freezer(reducer: RootReducer) {
  return (state: RootState | undefined, action: AnyCustomAction): RootState => {
    return FreezeState(reducer(state, action));
  };
}

export default Freezer;

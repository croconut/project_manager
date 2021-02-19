import * as types from "src/staticData/types";
// this reducer will read in all posts and gets to server
// and will also look at any add or modify request to store
// and mark status as dirty

// initial statuses: INITIAL && login=false

// login succeeded with store changes ? SYNCED && set login to true
// login failed or logout ? set login to false
// info request failed ? FETCH_ERROR
// during some fetch request from store ? FETCHING
// update request fail ? UPDATE_ERROR
// during some update request to store ? UPDATING
// an action has changed store values and server hasn't been updated ? NOT_SYNCED

const defaultStatus: types.StoreStatus = {
  status: "INITIAL",
  lastFailure: "none_yet",
  loggedIn: false,
};

export const serverState = (
  // ensures that undefined case still has defined initial state
  state: types.StoreStatus = defaultStatus,
  action: types.AnyCustomAction
): types.StoreStatus => {
  switch (action.type) {
    case types.FETCHING_DATA:
      return { ...state, status: "FETCHING" };
    case types.UPDATING_SERVER:
      return { ...state, status: "UPDATING" };
    case types.LOGIN_COMPLETE:
      return { ...state, loggedIn: true, status: "SYNCED" };
    case types.FETCH_FAILURE:
      return { loggedIn: false, status: "FETCH_NEEDED", lastFailure: action.payload.reason };
    case types.ADD_TASK:
    case types.ADD_TASKLIST:
    case types.MODIFY_TASK:
    case types.MODIFY_TASKLIST:
    case types.REMOVE_TASK:
    case types.REMOVE_TASKLIST:
    case types.REORDER_TASK:
    case types.REPLACE_ALL_TASKLISTS:
    case types.RESTAGE_TASK:
    case types.UPDATE_USER:
      return { ...state, status: "UPDATE_NEEDED" };
    default:
      return state;
  }
};

export default serverState;

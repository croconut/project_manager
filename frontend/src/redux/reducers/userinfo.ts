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

const defaultStatus: types.IUserInfo = {
  username: "none",
  __v: 0,
  color: "#3ff",
  createdAt: new Date(Date.now()),
  email: "fake",
  icon: "none",
  updatedAt: new Date(Date.now()),
};

const userInfo = (
  // ensures that undefined case still has defined initial state
  state: types.IUserInfo = defaultStatus,
  action: types.AnyCustomAction
): types.IUserInfo => {
  switch(action.type) {
    case types.LOGIN_COMPLETE:
      return action.payload.user;
    default:
      return state;
  }
};

export default userInfo;
///
/// summary
///

// this file needs to do all of one thing: 
// maintain an array of objects that need to be updated: 
// when an item gets popped from the dirty stack it gets placed in the
// updating stack then either gets put back in dirty stack OR gets
// removed entirely
// when a change is made to a part of the store that must be 
// kept up to date on the server (most things) then its id 
// chain (id of user => tasklist => task if its a task 
// or just user => tasklist if its a tasklist or many tasks in 
// a tasklist) 
// and highest level type (user for all the current stuff) must be put in the array

// when the updater function checks for more updates to do, it will 
// pop the next action to take and perform that update

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


// need to parse the array on many types of updates => 
// anytime we're updating something that can have children, we'll need to go through
// all the parents and grandparents of stuff and 
const defaultStatus: types.StoreStatus = {
  dirty: [],
  updating: [],
};

export const storeState = (
  // ensures that undefined case still has defined initial state
  state: types.StoreStatus = defaultStatus,
  action: types.AnyCustomAction
): types.StoreStatus => {
  switch (action.type) {
    case types.FETCHING_DATA:
    case types.UPDATING_SERVER:
    case types.LOGIN_COMPLETE:
    case types.LOGOUT_COMPLETE:
    case types.FETCH_FAILURE:
    case types.UPDATE_FAILURE:
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
    default:
      return state;
  }
};

export default storeState;

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

// is an object, just grab the first key
const defaultStatus: types.IUpdateStates = {};

export const storeState = (
  // ensures that undefined case still has defined initial state
  state: types.IUpdateStates = defaultStatus,
  action: types.AnyCustomAction
): types.IUpdateStates => {
  const typesObject: types.TUpdateTypes = {};
  var id = "";
  switch (action.type) {
    // resetting the dirty stuff when we've logged in or out
    case types.LOGIN_COMPLETE:
    case types.LOGOUT_COMPLETE:
      return defaultStatus;
    // alright here's the important part of logic
    // if we add an aspect to something that is already being updated, we need to kinda
    // ignore the next server update from the tasklist change except in case where
    // server had a more update to date __v than we did
    // aka we should be sending the __v with every update request
    // and should be receiving and setting a new __v with every CRUD request
    case types.ADD_TASK:
      typesObject[types.UpdateType.ADD_TASK] = 1;
      id = action.payload.tasklistID;
      break;
    case types.MODIFY_TASK:
      typesObject[types.UpdateType.SET_TASKS] = 1;
      id = action.payload.tasklistID;
      break;
    case types.RESTAGE_TASK:
      typesObject[types.UpdateType.SET_STAGES] = 1;
      id = action.payload.tasklistID;
      break;
    case types.REMOVE_TASK:
      typesObject[types.UpdateType.SET_TASKS] = 1;
      typesObject[types.UpdateType.SET_STAGES] = 1;
      id = action.payload.tasklistID;
      break;
    // deprecating the add_tasklist, it should be done through database only
    case types.MODIFY_TASKLIST:
      typesObject[types.UpdateType.TASKLIST_INFO] = 1;
      id = action.payload.tasklist._id;
      break;
    case types.REMOVE_TASKLIST:
      typesObject[types.UpdateType.REMOVE_TASKLIST] = 1;
      id = action.payload.tasklist._id;
      break;
    case types.UPDATING_SERVER:
    case types.UPDATE_FAILURE:
      return state;
    default:
      return state;
  }
  if (id === "") return state;
  const existing = state[id];
  // must only allow one concurrent add_task at a time
  // so server should grey out the add button until the previous task 
  // has been fully added in
  if (
    existing &&
    (existing.updating ||
      existing.types[types.UpdateType.ADD_TASK] !== undefined)
  ) {
    // o h    n o , this is the rough situation, gonna have to expect some
    // annoying stuff ---> basically we gonna add a 1 to the id and expand that one instead
    id += "1";
    // on store update, will check if there was a one attached to the end of the thing
    // if there was, we immediately push the next update and only update the stuff we would really have to
    // like object ids for newly created objects
    // mostly works cuz we only allow one thing to update at a time since we're rate limiting on server (#soon)
  }

  return {
    ...state,
    [id]: {
      updating: false,
      types: {
        ...state[id]?.types,
        ...typesObject,
      },
    },
  };
};

export default storeState;

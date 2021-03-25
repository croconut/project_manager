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

import { ID_ADDITION } from "src/staticData/Constants";
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
// ids are always 24 characters long, so just adding a digit is completely safe
// but we want something that also cant exist in a mongodb objectid
// this should be a single char btw

const addUpdate = (
  id: string,
  typesObject: types.TUpdateTypes,
  state: types.IUpdateStates
) => {
  if (id === "") return state;
  const existing = state[id];
  // if theres already an update in progress, we wanna skip
  if (existing && existing.updating) {
    id += ID_ADDITION;
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

export const storeState = (
  // ensures that undefined case still has defined initial state
  state: types.IUpdateStates = defaultStatus,
  action: types.AnyCustomAction
): types.IUpdateStates => {
  const typesObject: types.TUpdateTypes = {};
  var id = "";
  switch (action.type) {
    // resetting the dirty stuff when we've logged in or out

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
    // this is the case where the server has replied to a tasklist remove request
    case types.REMOVE_TASKLIST:
      const stateRemoved = {...state};
      delete stateRemoved[action.payload.tasklistID];
      delete stateRemoved[`${action.payload.tasklistID}${ID_ADDITION}`];
      return stateRemoved;
    // all the immediate return cases start here
    case types.LOGIN_COMPLETE:
    case types.LOGOUT_COMPLETE:
      return defaultStatus;
    case types.UPDATING_SERVER:
      var obj = state[action.payload._id];
      if (obj !== undefined) {
        return { ...state, [action.payload._id]: { ...obj, updating: true } };
      }
      return state;
    // need to notify to retry update on failure
    case types.UPDATE_FAILURE:
      obj = state[action.payload._id];
      if (obj !== undefined) {
        return { ...state, [action.payload._id]: { ...obj, updating: false } };
      }
      return state;
    case types.TASKLIST_UPDATED:
      // swap the ID_ADDITION version in if it exists for this id
      // or just delete the old one
      const stateCopy = { ...state };
      const id2 = action.payload.tasklist._id;
      if (stateCopy[id2 + ID_ADDITION] !== undefined) {
        stateCopy[id2] = { ...stateCopy[id2 + ID_ADDITION] };
        delete stateCopy[id2 + ID_ADDITION];
      } else {
        delete stateCopy[id2];
      }
      return stateCopy;
    // also need a user_updated one that is nearly the same as the tasklist updated one
    default:
      return state;
  }
  // most cases are very similar, so grouped together at end
  return addUpdate(id, typesObject, state);
};

export default storeState;

// IMPORTANT none of these objects are being FROZEN
// INSTEAD the actual state will only be mutated when the MODIFY action is called
// since the selectors only return full copies (assumes no nested objects, arrays are known
// and each is spread)

// internal functions, do not export selectors that aren't giving deep copies
const _getTasklists = (state) => state.tasklistHolder.tasklists;
const _getTasklistIDS = (state) => state.tasklistHolder.ids;

// everything is getting manual deep copying or spreading for shallow copying
export const getTasklists = (state) => {
  // IMPORTANT: must guarantee that this function won't modify original state
  // dont wanna copy here since there will be no data modification
  
  let lists = _getTasklists(state);
  let copy = new Array(lists.length);
  for (let i = 0; i < lists.length; i++) {
    // this would normally be an extracted function
    let tasks = lists[i].tasks;
    let taskCopy = new Array(tasks.length);
    for (let j = 0; j < tasks.length; j++) {
      // tasks are flat objects, shallow is best
      taskCopy[j] = { ...tasks[j] };
    }
    copy[i] = { ...lists[i], ...{ tasks: taskCopy } };
  }
  return copy;
};

export const getTasklistIDs = (state) => ({ ...state.tasklistHolder.ids });

export const getTasklistByName = (state, props) => {
  var tasklists = _getTasklists(state);
  if (!tasklists) return null;
  for (let i = 0; i < tasklists.length; i++) {
    if (tasklists[i].name === props.name) {
      let tasks = tasklists[i].tasks;
      let taskCopy = new Array(tasks.length);
      for (let j = 0; j < tasks.length; j++) {
        // tasks are flat objects, shallow is best
        taskCopy[j] = { ...tasks[j] };
      }
      return { ...tasklists[i], ...{ tasks: taskCopy } };
    }
  }
  return null;
};

export const getTasklistByIndex = (state, props) => {
  var tasklists = _getTasklists(state);
  if (!tasklists) return null;
  if (tasklists.length <= props.index) return null;
  let tasks = tasklists[props.index].tasks;
  let taskCopy = new Array(tasks.length);
  for (let j = 0; j < tasks.length; j++) {
    // tasks are flat objects, shallow is best
    taskCopy[j] = { ...tasks[j] };
  }
  // other than tasks, tasklist is shallow object
  return { ...tasklists[props.index], ...{ tasks: taskCopy } };
};

// note: it's .id not ._id here
export const getTasklistById = (state, props) => {
  var tasklists = _getTasklists(state);
  var ids = _getTasklistIDS(state);
  let tasks = tasklists[ids[props.id]].tasks;
  let taskCopy = new Array(tasks.length);
  for (let j = 0; j < tasks.length; j++) {
    // tasks are flat objects, shallow is best
    taskCopy[j] = { ...tasks[j] };
  }
  return { ...tasklists[ids[props.id]], ...{ tasks: taskCopy } };
};

export const getUserInfo = (state) => ({ ...state.userInfo });

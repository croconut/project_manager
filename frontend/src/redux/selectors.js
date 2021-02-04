export const getTasklists = (store) => store.tasklistHolder.tasklists;

export const getTasklistIDs = (store) => store.tasklistHolder.ids;

export const getTasklistByName = (store, name) => {
  var tasklists = getTasklists(store);
  if (!tasklists) return null;
  for (let i = 0; i < tasklists.length; i++) {
    if (tasklists[i].name === name) return tasklists[i];
  }
  return null;
};

export const getTasklistByIndex = (store, index) => {
  var tasklists = getTasklists(store);
  if (!tasklists) return null;
  if (tasklists.length <= index) return null;
  return tasklists[index];
};

export const getTasklistById = (store, id) => {

};

export const getUserInfo = (store) => {
  return {
    username: store.username,
    email: store.email,
    icon: store.icon,
    color: store.color,
  };
};

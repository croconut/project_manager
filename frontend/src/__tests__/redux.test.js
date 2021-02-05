import configureStore from "../redux/configureStore";
import faker from "faker";
import { v4 as idgen } from "uuid";
import * as actions from "../redux/actions";
import * as selectors from "../redux/selectors";
import { addTasklist } from "../redux/actionTypes";

// essentially the unit tests for the redux library
// will not be using store.getState() or dispatches directly in
// any component code BUT this is the easiest way to ensure they work
// as intended
// TODO set up component based end-to-end tests
describe("store actions and selection tests", () => {
  const store = configureStore();
  const tasklistArray = new Array(1000);
  for (let i = 0; i < tasklistArray.length; i++) {
    const tasks = new Array(Math.ceil(Math.random() * 35));
    for (let j = 0; j < tasks.length; j++) {
      tasks[j] = {
        _id: idgen(),
        name: faker.name.jobTitle(),
        description: faker.name.jobDescriptor(),
      };
    }
    tasklistArray[i] = {
      _id: idgen(),
      name: faker.internet.userName(),
      description: faker.address.city(),
      tasks: tasks,
    };
  }
  const serverInit = [
    {
      _id: idgen(),
      name: faker.internet.userName(),
      description: faker.address.city(),
      tasks: [
        {
          _id: idgen(),
          name: faker.name.jobTitle(),
          description: faker.name.jobDescriptor(),
        },
      ],
    },
  ];

  const serverInit2 = [
    {
      _id: idgen(),
      name: faker.internet.userName(),
      description: faker.address.city(),
      tasks: [
        {
          _id: idgen(),
          name: faker.name.jobTitle(),
          description: faker.name.jobDescriptor(),
        },
      ],
    },
  ];

  // helper functions (just make it easier to write the tests tbh)

  const getRandomList = (store) => {
    let index = Math.floor(Math.random() * 1000) % getTLs(store).length;
    return selectors.getTasklistByIndex(store.getState(), index);
  };

  const modTList = (store, tasklist) => {
    store.dispatch(actions.modifyTasklist(tasklist));
    return selectors.getTasklists(store.getState());
  };

  const addTList = (store, tasklist) => {
    store.dispatch(actions.addTasklist(tasklist));
    return selectors.getTasklists(store.getState());
  };

  const removeTList = (store, tasklist) => {
    store.dispatch(actions.removeTasklist(tasklist));
    return selectors.getTasklists(store.getState());
  };

  const initTLists = (store, tasklists) => {
    store.dispatch(actions.updateTasklistsFromServer(tasklists));
    return selectors.getTasklists(store.getState());
  };

  const getTLids = (store) => {
    return selectors.getTasklistIDs(store.getState());
  };

  const getTLs = (store) => {
    return selectors.getTasklists(store.getState());
  };

  let currentTasklists;

  afterEach(() => {
    currentTasklists = getTLs(store);
  });

  it("tasklists can be initialized", () => {
    var list = initTLists(store, serverInit);
    expect(list).toEqual(serverInit);
  });

  it("tasklists can be reinitialized", () => {
    var list = initTLists(store, serverInit2);
    expect(list).toEqual(serverInit2);
    list = initTLists(store, tasklistArray);
    expect(list).toEqual(tasklistArray);
  });

  it("tasklists can be added to", () => {
    var list = addTList(store, serverInit[0]);
    // this store should be identical
    const newStore = [...currentTasklists, serverInit[0]];
    expect(list).toEqual(newStore);
    expect(getTLids(store)[serverInit[0]._id]).toEqual(list.length - 1);
  });

  it("tasklists can be modified", () => {
    // const is such a joke in js haha
    const tasklistToModify =
      tasklistArray[Math.floor(Math.random() * 1000) % tasklistArray.length];
    tasklistToModify.name = "hey what up";
    tasklistToModify.tasks = [
      ...tasklistToModify.tasks,
      { name: "task2", description: "bruuuuh" },
    ];
    let list = modTList(store, tasklistToModify);
    let ids = getTLids(store);
    expect(list[ids[tasklistToModify._id]]).toEqual(tasklistToModify);
  });

  it("tasklists can be removed", () => {
    let index = Math.floor(Math.random() * 1000) % currentTasklists.length;
    let list = removeTList(store, currentTasklists[index]);
    // can no longer find the tasklist's id
    let ids = getTLids(store);
    // ensuring we're checking against the old list
    expect(ids[currentTasklists[index]._id]).toBeUndefined();
    expect(list.length).toEqual(currentTasklists.length - 1);
  });

  it("ids still map to tasklists properly after modifications and task removal", () => {
    let list = getTLs(store);
    let ids = getTLids(store);
    for (let i = 0; i < list.length; i++) {
      let id = list[i]._id;
      let index = ids[id];
      expect(i).toEqual(index);
    }
  });

  // also tests immutability of an item retrieved with selector
  it("cant modify or remove tasklist if id is changed", () => {
    let tasklist = getRandomList(store);
    const oldId = tasklist._id;
    // an id that cannot exist
    const id = "129385070";
    tasklist._id = id;
    modTList(store, tasklist);
    var ids = getTLids(store);
    var listBeforeRemove = getTLs(store);
    // ensure modification to tasklist's id
    // does not effect tasklist ids
    expect(ids[id]).toBeUndefined();
    // ensure modification to tasklist
    // does not effect tasklists array
    
    expect(listBeforeRemove[ids[oldId]]._id).toEqual(oldId);
    
    removeTList(store, tasklist);
    var listAfterRemove = getTLs(store);
    var idsAfterRemove = getTLids(store);
    // same for removing SINCE that tasklist._id doesn't exist 
    // in the store's copy of that tasklist
    expect(idsAfterRemove[oldId]).toBeDefined();
    expect(listBeforeRemove.length).toEqual(listAfterRemove.length);
  });
  it.todo("selectors return correct tasklists");
  it.todo("task CRUD with tasklist id and task only");
});

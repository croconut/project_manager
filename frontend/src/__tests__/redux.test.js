import configureStore from "../redux/configureStore";
import faker from "faker";
import { v4 as idgen } from "uuid";
import * as actions from "../redux/actions";
import * as selectors from "../redux/selectors";

// essentially the unit tests for the redux library
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

  let currentTasklists;

  afterEach(() => {
    currentTasklists = selectors.getTasklists(store.getState());
  });

  it("tasklists can be initialized", () => {
    store.dispatch(actions.updateTasklistsFromServer(serverInit));
    expect(selectors.getTasklists(store.getState())).toEqual(serverInit);
  });

  it("tasklists can be reinitialized", () => {
    store.dispatch(actions.updateTasklistsFromServer(serverInit2));
    expect(selectors.getTasklists(store.getState())).toEqual(serverInit2);
    store.dispatch(actions.updateTasklistsFromServer(tasklistArray));
    expect(selectors.getTasklists(store.getState())).toEqual(tasklistArray);
  });

  it("tasklists can be added to", () => {
    store.dispatch(actions.addTasklist(serverInit[0]));
    // this store should be identical
    const newStore = [...currentTasklists, serverInit[0]];
    // new tasklist is last in list
    expect(selectors.getTasklists(store.getState())).toEqual(newStore);
    // new tasklist id is mapped to that index position
    expect(selectors.getTasklistIDs(store.getState())[serverInit[0]._id]).toEqual(newStore.length - 1);
  });

  it("tasklists can be modified", () => {
    
    // const is such a joke in js haha
    const tasklistToModify =
    tasklistArray[
        Math.floor(Math.random() * 1000) % tasklistArray.length
      ];
    tasklistToModify.name = "hey what up";
    tasklistToModify.tasks = [
      ...tasklistToModify.tasks,
      { name: "task2", description: "bruuuuh" },
    ];
    store.dispatch(actions.modifyTasklist(tasklistToModify));
    let tasklist = selectors.getTasklists(store.getState());
    let ids = selectors.getTasklistIDs(store.getState());
    expect(tasklist[ids[tasklistToModify._id]]).toEqual(tasklistToModify);
  });

  it("tasklists can be removed", () => {
    let index = Math.floor(Math.random() * 1000) % currentTasklists.length;
    store.dispatch(actions.removeTasklist(currentTasklists[index]));
    // can no longer find the tasklist's id
    expect(
      selectors.getTasklistIDs(store.getState())[currentTasklists[index]._id]
    ).toBeUndefined();
    let tasklists = selectors.getTasklists(store.getState());
    expect(tasklists.length).toEqual(currentTasklists.length - 1);
  });

  it("ids still map to tasklists properly after modifications and task removal", () => {
    let tasklistFromStore = selectors.getTasklists(store.getState());
    let idsFromStore = selectors.getTasklistIDs(store.getState());
    for (let i = 0; i < tasklistFromStore.length; i++) {
      let id = tasklistFromStore[i]._id;
      let index = idsFromStore[id];
      expect(i).toEqual(index);
    }
  });

  // it("cant modify or remove tasklist if id is changed")
});

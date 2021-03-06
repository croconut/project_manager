import configureStore, { RootStore } from "src/redux/configureStore";
import faker from "faker";
import { v4 as idgen } from "uuid";
import * as actions from "src/redux/actions";
import * as selectors from "src/redux/selectors";
import { ITasklist, TTasklists, TTasks } from "src/staticData/types";
import { TaskStage } from "src/staticData/Constants";

// essentially the unit tests for the redux library
// will not be using store.getState() or dispatches directly in
// any component code BUT this is the easiest way to ensure they work
// as intended
// TODO set up component based end-to-end tests
describe("store actions and selection tests", () => {
  const store: RootStore = configureStore();
  const tasklistArray: TTasklists = new Array(1000);

  const createTasklist = (): ITasklist => {
    const tasks: TTasks = new Array(Math.ceil(Math.random() * 35));
    for (let j = 0; j < tasks.length; j++) {
      tasks[j] = {
        _id: idgen(),
        name: faker.name.jobTitle(),
        description: faker.name.jobDescriptor(),
        assignedUserIcon: "fa folder",
        assignedUsername: faker.name.title(),
        stage: TaskStage[Math.floor(Math.random() * 12) % TaskStage.length],
        priority: j,
      };
    }
    return {
      _id: idgen(),
      name: faker.internet.userName(),
      description: faker.address.city(),
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
      tasks: tasks,
    };
  };

  for (let i = 0; i < tasklistArray.length; i++) {
    tasklistArray[i] = createTasklist();
  }
  const serverInit: TTasklists = [createTasklist()];

  const serverInit2: TTasklists = [createTasklist()];

  // helper functions (just make it easier to write the tests tbh)

  const getRandomList = (store: RootStore): ITasklist | null => {
    let index = Math.floor(Math.random() * 1000) % getTLs(store).length;
    return selectors.getTasklistByIndex(store.getState(), { index });
  };

  const modTList = (store: RootStore, tasklist: ITasklist) => {
    store.dispatch(actions.modifyTasklist(tasklist));
    return selectors.getTasklists(store.getState());
  };

  const addTList = (store: RootStore, tasklist: ITasklist) => {
    store.dispatch(actions.addTasklist(tasklist));
    return selectors.getTasklists(store.getState());
  };

  const removeTList = (store: RootStore, tasklist: ITasklist) => {
    store.dispatch(actions.removeTasklist(tasklist));
    return selectors.getTasklists(store.getState());
  };

  const initTLists = (store: RootStore, tasklists: TTasklists) => {
    store.dispatch(actions.updateTasklistsFromServer(tasklists));
    return selectors.getTasklists(store.getState());
  };

  const getTLids = (store: RootStore) => {
    return selectors.getTasklistIDS(store.getState());
  };

  const getTLs = (store: RootStore) => {
    return selectors.getTasklists(store.getState());
  };

  const getTLByID = (store: RootStore, id: string) => {
    return selectors.getTasklistById(store.getState(), { id });
  };

  const getTLByIndex = (store: RootStore, index: number) => {
    return selectors.getTasklistByIndex(store.getState(), { index });
  }

  const getTasksSplitFromID = (store: RootStore, id: string) => {
    return selectors.getTasksSplitByStageID(store.getState(), { id });
  }

  const getTasksSplitFromIndex = (store: RootStore, index: number) => {
    return selectors.getTasksSplitByStageIndex(store.getState(), { index });
  }

  let currentTasklists: TTasklists;

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
    const ids = getTLids(store);
    expect(ids[serverInit[0]?._id]).toEqual(list.length - 1);
  });

  it("tasklists cannot be modified without using the store", () => {
    // const is such a joke in js haha
    const tasklistToModify = getRandomList(store);
    if (!tasklistToModify) {
      console.error("tasklist not returned from getRandomList");
      return;
    }
    // this doesn't change the store's state
    expect(() => (tasklistToModify.name = "heybud")).toThrowError(
      "Cannot assign to read only property 'name' of object '#<Object>'"
    );
    const moddableTask = { ...tasklistToModify };
    // neither does this
    moddableTask.tasks = [
      ...moddableTask.tasks,
      {
        _id: "blah",
        assignedUserIcon: "aga",
        assignedUsername: "apgoisna",
        description: "a;posdigj ",
        name: "aspgdoia",
        stage: TaskStage[1],
        priority: 5,
      },
    ];
    expect(getTLByID(store, tasklistToModify._id)?.tasks).toEqual(
      tasklistToModify.tasks
    );
    // confirmed here
    expect(getTLByID(store, tasklistToModify._id)?.name).not.toEqual("heybud");
  });

  it("tasklists can be modified through store", () => {
    const tasklistToModify = getRandomList(store);
    if (tasklistToModify === null) {
      console.error("tasklist not returned from getRandomList");
      return;
    }
    // cant modify when i get an object like this :d
    expect(() => (tasklistToModify.name = "heybud")).toThrowError(
      "Cannot assign to read only property 'name' of object '#<Object>'"
    );
    // dont forget, const is still a joke :)
    const moddableTask = { ...tasklistToModify };
    moddableTask.tasks = [
      ...moddableTask.tasks,
      {
        _id: "blah",
        assignedUserIcon: "aga",
        assignedUsername: "apgoisna",
        description: "a;posdigj ",
        name: "aspgdoia",
        stage: TaskStage[1],
        priority: 3,
      },
    ];
    modTList(store, moddableTask);
    expect(getTLByID(store, tasklistToModify._id)).toEqual(moddableTask);
    expect(getTLByID(store, tasklistToModify._id)?.name).not.toEqual("heybud");
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
    const tasklist = getRandomList(store);
    // if somehow we didn't get something, should never happen in this test @.@
    if (tasklist === null) {
      console.error("tasklist not returned from getRandomList");
      return;
    }
    const oldId = tasklist._id;
    // an id that cannot exist
    const id = "129385070";
    expect(() => tasklist._id = id).toThrowError(
      "Cannot assign to read only property '_id' of object '#<Object>'"
    );
    const moddable = {...tasklist};
    moddable._id = id;
    modTList(store, moddable);
    var ids = getTLids(store);
    var listBeforeRemove = getTLs(store);
    // ensure modification to tasklist's id
    // does not effect tasklist ids
    expect(ids[id]).toBeUndefined();
    // ensure modification to tasklist
    // does not effect tasklists array

    expect(listBeforeRemove[ids[oldId]]._id).toEqual(oldId);

    removeTList(store, moddable);
    var listAfterRemove = getTLs(store);
    var idsAfterRemove = getTLids(store);
    // same for removing SINCE that tasklist._id doesn't exist
    // in the store's copy of that tasklist
    expect(idsAfterRemove[oldId]).toBeDefined();
    expect(listBeforeRemove.length).toEqual(listAfterRemove.length);
  });

  it("selectors that separate tasks by stage work", () => {
    const tasklist = getRandomList(store);
    // if somehow we didn't get something, should never happen in this test @.@
    if (tasklist === null) {
      console.error("tasklist not returned from getRandomList");
      return;
    }
    const splitTasks = getTasksSplitFromID(store, tasklist._id);
    const checkSplit = (tasks: Array<TTasks> | null, listHolder: ITasklist) => {
      if (tasks === null) {
        console.error("tasklist somehow has no tasks");
        return;
      }
      // want last array to be empty
      expect(tasks[TaskStage.length].length).toEqual(0);
      // want each array to only contain tasks with appropriate stages
      let count = 0;
      for (let i = 0; i < tasks.length - 1; i++) { 
        const sublist = tasks[i];
        count += sublist.length;
        for (let j = 0; j < sublist.length; j++) {
          expect(sublist[j].stage).toEqual(TaskStage[i]);
        }
      }
      // want to have ALL the tasks in the tasklist
      expect(count).toEqual(listHolder.tasks.length);
    }
    checkSplit(splitTasks, tasklist);
    const splitTasks2 = getTasksSplitFromIndex(store, 90);
    const tasklist2 = getTLByIndex(store, 90);
    if (tasklist2 === null) {
      console.error("tasklist not returned from index 90");
      return;
    }
    checkSplit(splitTasks2, tasklist2);
  });

  it.todo("state returned from a selector cannot be modified");
  it.todo("selectors return correct tasklists");
  it.todo("task CRUD with tasklist id and task only");
});

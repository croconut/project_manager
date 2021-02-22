const request = require("supertest");
const { TaskStage } = require("../app/staticData/ModelConstants");
const api = require("../app/staticData/Routes");

describe("can perform task CRUD operations", () => {
  let cookie;
  let currentUser;

  let user1 = {
    email: "blah@mail.co",
    username: "some-username",
    password: "noonecaresabout432PASSword",
  };

  const checkUnchanged = async () => {
    const response = await getInfo();
    expect(response.body.tasklists).toEqual(currentUser.tasklists);
  };

  const getInfo = async () => {
    return await request(server)
      .get(api.usersPrivateInfo.route)
      .set("Cookie", cookie)
      .expect(200);
  };

  beforeAll(async (done) => {
    const response = await request(server)
      .post(api.registerRouter.route)
      .send(user1)
      .expect(201);
    cookie = response.headers["set-cookie"][1];
    expect(cookie).toBeDefined();
    currentUser = response.body.user;
    delete currentUser.updatedAt;
    done();
  });

  it("can read tasks", async () => {
    const response = await request(server)
      .get(
        api.taskReadOne.route +
          currentUser.tasklists[0]._id +
          "/" +
          currentUser.tasklists[0].tasks[0]._id
      )
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.name).toEqual(currentUser.tasklists[0].tasks[0].name);
  });

  it("cant read tasks that dont exist", async () => {
    const promises = [];
    promises.push(
      request(server)
        .get(api.taskReadOne.route + "completecrap")
        .set("Cookie", cookie)
        .expect(404)
    );
    promises.push(
      request(server)
        .get(api.taskReadOne.route)
        .set("Cookie", cookie)
        .expect(404)
    );
    promises.push(
      request(server)
        .get(api.taskReadOne.route + currentUser.tasklists[0]._id + "/")
        .set("Cookie", cookie)
        .expect(404)
    );
    promises.push(
      request(server)
        .get(
          api.taskReadOne.route +
            currentUser.tasklists[0]._id +
            "/randomegarbage"
        )
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .get(api.taskReadOne.route + "garbage/garbage-trash")
        .set("Cookie", cookie)
        .expect(400)
    );
    await Promise.all(promises);
  });

  it("can add a valid task to a tasklist", async () => {
    const taskname = "task name is the only required argument";
    const response = await request(server)
      .post(api.taskAdd.route + currentUser.tasklists[0]._id)
      .send({
        tasks: [
          { name: "first task im adding", priority: 3, stage: TaskStage[1] },
          { name: taskname, priority: 3, stage: TaskStage[2], baloney: "blah" },
        ],
      })
      .set("Cookie", cookie)
      .expect(200);
    const tasks = response.body.tasklist.tasks;
    expect(tasks[tasks.length - 1].name).toEqual(taskname);
    expect(tasks[tasks.length - 1].baloney).not.toBeDefined();
  });

  it("can set tasks to a new or empty array", async () => {
    const tasks = currentUser.tasklists[0].tasks;
    tasks[0].name = "paul blart";
    tasks[1].priority = 28;
    tasks[3].stage = TaskStage[3];
    tasks[2].description = "so fing lame";
    const response = await request(server)
      .post(api.taskSet.route + currentUser.tasklists[0]._id)
      .send({ tasks: [], empty: true })
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.tasklist.tasks).toEqual([]);
    const response2 = await request(server)
      .post(api.taskSet.route + currentUser.tasklists[0]._id)
      .send({ tasks: tasks })
      .set("Cookie", cookie)
      .expect(200);
    expect(response2.body.tasklist.tasks).toEqual(tasks);
  });

  it("can update a single task", async () => {
    const task = currentUser.tasklists[0].tasks[0];
    task.name = "random assed name yo";
    task.description = "something new";
    const response = await request(server)
      .post(
        api.taskUpdate.route +
          currentUser.tasklists[0]._id +
          "/" +
          currentUser.tasklists[0].tasks[0]._id
      )
      .send({ task: task })
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.tasklist.tasks[0]).toEqual(task);
  });

  it("can delete a single task", async () => {
    const response = await request(server)
      .delete(
        api.taskDelete.route +
          currentUser.tasklists[0]._id +
          "/" +
          currentUser.tasklists[0].tasks[0]._id
      )
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.tasklist.tasks.length).toEqual(
      currentUser.tasklists[0].tasks.length - 1
    );
  });

  it("refuses bad add requests", async () => {
    const response = await getInfo();
    currentUser = response.body;
    delete currentUser.updatedAt;
    const promises = [];
    promises.push(
      request(server)
        .post(api.taskAdd.route + currentUser.tasklists[0]._id)
        .send({
          tasks: [
            { name: "first task im adding", stage: TaskStage[1] },
            { name: "crap", priority: 3, stage: TaskStage[2], baloney: "blah" },
          ],
        })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .post(api.taskAdd.route + currentUser.tasklists[0]._id)
        .send({
          tasks: [
            { name: "first task im adding", priority: 2 },
            { name: "crap", priority: 3, stage: TaskStage[2], baloney: "blah" },
          ],
        })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .post(api.taskAdd.route + currentUser.tasklists[0]._id)
        .send({
          tasks: [],
        })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .post(api.taskAdd.route + currentUser.tasklists[0]._id)
        .send({
          tasks: [{}],
        })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .post(api.taskAdd.route + "badname")
        .send({
          tasks: [
            { name: "first task im adding", priority: 3, stage: TaskStage[1] },
            {
              name: "something fine",
              priority: 3,
              stage: TaskStage[2],
            },
          ],
        })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .post(api.taskAdd.route)
        .send({
          tasks: [
            { name: "first task im adding", priority: 3, stage: TaskStage[1] },
            {
              name: "something fine",
              priority: 3,
              stage: TaskStage[2],
            },
          ],
        })
        .set("Cookie", cookie)
        .expect(404)
    );

    await Promise.all(promises);
    await checkUnchanged();
  });

  it("refuses bad set requests", async () => {
    const promises = [];
    // checking against current user so we want copy of the task objects
    const goodtasks = currentUser.tasklists[0].tasks.map((a) => ({ ...a }));
    const tasks = goodtasks.map((a) => ({ ...a }));
    const tasks2 = goodtasks.map((a) => ({ ...a }));
    const tasks3 = goodtasks.map((a) => ({ ...a }));
    const tasks4 = goodtasks.map((a) => ({ ...a }));
    const tasks5 = goodtasks.map((a) => ({ ...a }));
    const tasks6 = { faker: "i swear im an array" };
    // this is illegal if you dont also specify that you're passing an empty array
    const tasks7 = [];
    goodtasks[2].name = "new name!";
    delete tasks[2].priority;
    tasks2[1].name = "";
    tasks3[2].stage = "not a stage man";
    delete tasks4[0].assignedUserIcon;
    tasks5[2].description = { text: "hey sup" };
    const setRequest = (tasks, expect) => {
      return request(server)
        .post(api.taskSet.route + currentUser.tasklists[0]._id)
        .send({ tasks })
        .set("Cookie", cookie)
        .expect(expect);
    };
    promises.push(setRequest(tasks, 400));
    promises.push(setRequest(tasks2, 400));
    promises.push(setRequest(tasks3, 400));
    promises.push(setRequest(tasks4, 400));
    promises.push(setRequest(tasks5, 400));
    promises.push(setRequest(tasks6, 400));
    promises.push(setRequest(tasks7, 400));
    promises.push(
      request(server)
        .post(api.taskSet.route + "invalidid")
        .send({ tasks: goodtasks })
        .set("Cookie", cookie)
        .expect(400)
    );
    // good task update change BUT bad id given
    promises.push(
      request(server)
        .post(api.taskSet.route + currentUser.tasklists._id)
        .send({ tasks: goodtasks })
        .set("Cookie", cookie)
        .expect(400)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("refuses bad update requests", async () => {
    const promises = [];
    const task = { ...currentUser.tasklists[0].tasks[0] };
    const goodtask = { ...task };
    const task2 = { ...task };
    const task3 = { ...task };
    const task4 = { ...task };
    const task5 = { ...task };
    const task6 = "hey im totally a task";
    goodtask.name = "a totally fine name";
    task.description = {};
    task2.name = "";
    delete task3.assignedUserIcon;
    delete task4._id;
    task5._id = currentUser.tasklists._id;
    const updateRequest = (task, expect) => {
      return request(server)
        .post(
          api.taskUpdate.route +
            currentUser.tasklists[0]._id +
            "/" +
            currentUser.tasklists[0].tasks[0]._id
        )
        .send({ task })
        .set("Cookie", cookie)
        .expect(expect);
    };
    promises.push(updateRequest(task, 400));
    promises.push(updateRequest(task2, 400));
    promises.push(updateRequest(task3, 400));
    // changing the _id through this operation is forbidden
    promises.push(updateRequest(task4, 403));
    // changing the _id through this operation is forbidden
    promises.push(updateRequest(task5, 403));
    // this is also forbidden cuz it's erasing an objectid
    promises.push(updateRequest(task6, 403));
    promises.push(
      request(server)
        .post(api.taskUpdate.route + currentUser.tasklists[0]._id + "/crap")
        .send({ task: goodtask })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .post(
          api.taskUpdate.route +
            "startercrap/" +
            currentUser.tasklists[0].tasks[0]._id
        )
        .send({ task: goodtask })
        .set("Cookie", cookie)
        .expect(400)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("refuses bad delete requests", async () => {
    const promises = [];
    promises.push(
      request(server)
        .delete(api.taskDelete.route + currentUser.tasklists[0]._id + "/crap")
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .delete(
          api.taskDelete.route + "crap/" + currentUser.tasklists[0].tasks[0]._id
        )
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .delete(api.taskDelete.route)
        .set("Cookie", cookie)
        .expect(404)
    );
    promises.push(
      request(server)
        .delete(api.taskDelete.route + currentUser.tasklists[0]._id)
        .set("Cookie", cookie)
        .expect(404)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });
});

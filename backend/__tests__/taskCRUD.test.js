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
    const response2 = await getInfo();
    currentUser = response2.body;
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
            "/" +
            "randomegarbage"
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
    await request(server)
      .post(api.taskAdd.route + currentUser.tasklists[0]._id)
      .send({
        tasks: [
          { name: "first task im adding", priority: 3, stage: TaskStage[1] },
          { name: taskname, priority: 3, stage: TaskStage[2], baloney: "blah" },
        ],
      })
      .set("Cookie", cookie)
      .expect(201);
    const response = await getInfo();
    const tasks = response.body.tasklists[0].tasks;
    expect(tasks[tasks.length - 1].name).toEqual(taskname);
    expect(tasks[tasks.length - 1].baloney).not.toBeDefined();
  });

  it("can set tasks to a new array", async () => {
    const tasks = currentUser.tasklists[0].tasks;
    tasks[0].name = "paul blart";
    tasks[1].priority = 28;
    tasks[3].stage = TaskStage[3];
    tasks[2].description = "so fing lame";
    await request(server)
      .post(api.taskSet.route + currentUser.tasklists[0]._id)
      .send({ tasks: tasks })
      .set("Cookie", cookie)
      .expect(204);
    const response = await getInfo();
    expect(response.body.tasklists[0].tasks).toEqual(tasks);
  });

  it("can update a single task", async () => {
    const task = currentUser.tasklists[0].tasks[0];
    task.name = "random assed name yo";
    task.description = "something new";
    await request(server)
      .post(
        api.taskUpdate.route +
          currentUser.tasklists[0]._id +
          "/" +
          currentUser.tasklists[0].tasks[0]._id
      )
      .send({ task: task })
      .set("Cookie", cookie)
      .expect(204);
    const response = await getInfo();
    expect(response.body.tasklists[0].tasks[0]).toEqual(task);
  });
});

const request = require("supertest");
// const { delete } = require("../app/routes/tasklists");
// const User = require("../app/models/user.model");
const api = require("../app/staticData/Routes");

describe("can perform tasklist CRUD operations", () => {
  let cookie;
  let currentUser;

  let user1 = {
    email: "blah@mail.co",
    username: "some-username",
    password: "noonecaresabout432PASSword",
    tasklists: [
      {
        name: "first tasklist!",
        description: "fake af",
        tasks: [
          { name: "first task too!" },
          { name: "another one" },
          { name: "this one is way cooler" },
          {
            name: "this one got assigned to someone who doesn't exist lol",
            assignedUsername: "joe-bobby",
          },
          { name: "this one is way less cooler" },
          { name: "this one is just lame" },
        ],
      },
    ],
  };

  const checkUnchanged = async () => {
    const response = await getInfo();
    expect(response.body.tasklists).toEqual(currentUser.tasklists);
  };

  const getInfo = async () => {
    return await tester
      .get(api.usersPrivateInfo.route)
      .set("Cookie", cookie)
      .expect(200);
  };

  let tester;

  beforeAll(async (done) => {
    tester = request(server);
    const response = await tester.post(api.registerRouter.route).send(user1);
    cookie = response.headers["set-cookie"][1];
    expect(cookie).toBeDefined();
    currentUser = response.body.user;
    delete currentUser.updatedAt;
    done();
  });

  it("can add a new tasklist", async () => {
    const tasklist = {
      name: "some kinda tasklist",
      description: "yeah it's a nice tasklist am i right?",
    };
    await tester
      .post(api.tasklistAdd.route)
      .send(tasklist)
      .set("Cookie", cookie)
      .expect(201);
    const response = await getInfo();
    expect(response.body.tasklists.length).toEqual(
      currentUser.tasklists.length + 1
    );
    currentUser = response.body;
    delete currentUser.updatedAt;
  });

  it("can read a single tasklist", async () => {
    const response = await tester
      .get(api.tasklistReadOne.route + currentUser.tasklists[1]._id)
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.tasklist).toEqual(currentUser.tasklists[1]);
  });

  it("can read all tasklists", async () => {
    const response = await tester
      .get(api.tasklistReadAll.route)
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.tasklists).toEqual(currentUser.tasklists);
  });

  it("can update a single tasklist", async () => {
    const tasklist = {
      name: "this is my new name lol",
    };
    await tester
      .post(api.tasklistUpdate.route + currentUser.tasklists[1]._id)
      .send(tasklist)
      .set("Cookie", cookie)
      .expect(204);
    const response = await getInfo();
    expect(response.body.tasklists[1].name).not.toEqual(
      currentUser.tasklists[1].name
    );
    expect(response.body.tasklists[1].description).toEqual(
      currentUser.tasklists[1].description
    );
    expect(response.body.tasklists[1].name).toEqual(tasklist.name);
    currentUser = response.body;
    delete currentUser.updatedAt;
  });

  it("can delete tasklists", async () => {
    await tester
      .delete(api.tasklistDelete.route + currentUser.tasklists[1]._id)
      .set("Cookie", cookie)
      .expect(204);
    const response = await getInfo();
    expect(response.body.tasklists.length).toEqual(
      currentUser.tasklists.length - 1
    );
    currentUser = response.body;
    delete currentUser.updatedAt;
  });

  it("no tasklist operations without session cookie", async () => {
    const promises = [];
    promises.push(tester.get(api.tasklistReadAll.route).expect(302));
    promises.push(
      tester
        .get(api.tasklistReadOne.route + currentUser.tasklists[0]._id)
        .expect(302)
    );
    promises.push(
      tester
        .post(api.tasklistUpdate.route + currentUser.tasklists[0]._id)
        .send({ name: "lol" })
        .expect(302)
    );
    promises.push(
      tester
        .post(api.tasklistAdd.route)
        .send({ name: "lmao" })
        .expect(302)
    );
    promises.push(
      tester
        .delete(api.tasklistDelete.route + currentUser.tasklists[0]._id)
        .expect(302)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("refuses to add tasklists missing required arguments", async () => {
    const promises = [];
    promises.push(
      tester
        .post(api.tasklistAdd.route)
        .send({})
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistAdd.route)
        .send({ nae: "lmao" })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistAdd.route)
        .send({ name: "" })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistAdd.route)
        .send({ name: {} })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistAdd.route)
        .send({ description: "lmao" })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistAdd.route)
        .send({ description: "lmao", tasks: [] })
        .set("Cookie", cookie)
        .expect(400)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("refuses to update tasklists missing required arguments", async () => {
    const promises = [];
    promises.push(
      tester
        .post(api.tasklistUpdate.route + currentUser.tasklists[0]._id)
        .send({})
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistUpdate.route + currentUser.tasklists[0]._id)
        .send({ random: "something not on tasklist queue" })
        .set("Cookie", cookie)
        .expect(400)
    );
    // name or description exist but badly typed
    promises.push(
      tester
        .post(api.tasklistUpdate.route + currentUser.tasklists[0]._id)
        .send({ name: {} })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistUpdate.route + currentUser.tasklists[0]._id)
        .send({ description: {} })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistUpdate.route + currentUser.tasklists[0]._id)
        .send("just like a string here")
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistUpdate.route)
        .send({ name: "something that would be okay" })
        .set("Cookie", cookie)
        .expect(404)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("refuses to delete tasklists that dont exist", async () => {
    const promises = [];
    promises.push(
      tester
        .delete(api.tasklistDelete.route + "asgoina3333333333")
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .delete(api.tasklistDelete.route)
        .set("Cookie", cookie)
        .expect(404)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("cannot initialize/change tasks if invalidly sent for tasklist add / update", async () => {
    const taskname = "some kinda fake task";
    await tester
      .post(api.tasklistAdd.route)
      // show that description can be mistyped and still work
      // description will just be it's default
      .send({
        name: "a new tasklist name",
        description: { text: "not real" },
        // need name, priority, and stage to create a task
        // nae is mistyped and the task array will be initialized to [] instead
        tasks: [{ name: taskname }, { nae: "some other task" }],
      })
      .set("Cookie", cookie)
      .expect(201);
    const response = await getInfo();
    const newTasklist =
      response.body.tasklists[response.body.tasklists.length - 1];
    expect(newTasklist.tasks.length).toEqual(0);
    expect(newTasklist.description).toEqual("");
    const newName = "some other name";
    const newDescription = `{ text: "not real" }`;
    const faketasks = [{ name: taskname }, { name: "some other task" }];
    await tester
      .post(api.tasklistUpdate.route + newTasklist._id)
      .send({
        name: newName,
        description: newDescription,
        tasks: faketasks,
      })
      .set("Cookie", cookie)
      .expect(400);
    const response2 = await getInfo();
    const newTasklist2 =
      response2.body.tasklists[response2.body.tasklists.length - 1];
    // name and description were changed but task changes were ignored
    expect(newTasklist2.name).not.toEqual(newName);
    expect(newTasklist2.description).not.toEqual(newDescription);
    // update current user
    currentUser = response2.body;
    delete currentUser.updatedAt;
  });

  it("query params for update / delete / read get 404'd", async () => {
    const promises = [];
    promises.push(
      tester
        .delete(api.tasklistDelete.route + "?id=" + currentUser.tasklists[0]._id)
        .set("Cookie", cookie)
        .expect(404)
    );
    promises.push(
      tester
        .post(api.tasklistUpdate.route + "?id=" + currentUser.tasklists[0]._id)
        .send({ name: "decently creatable tasklist" })
        .set("Cookie", cookie)
        .expect(404)
    );
    promises.push(
      tester
        .get(api.tasklistReadOne.route + "?id=" + currentUser.tasklists[0]._id)
        .set("Cookie", cookie)
        .expect(404)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("even after deleting all tasklists, get empty tasklist when trying to readall instead of 404", async () => {
    const promises = [];
    const getuser = await getInfo();
    getuser.body.tasklists.forEach((element) => {
      promises.push(
        tester
          .delete(api.tasklistDelete.route + element._id)
          .set("Cookie", cookie)
          .expect(204)
      );
    });
    await Promise.all(promises);
    const response = await getInfo();
    expect(response.body.tasklists.length).toEqual(0);
    currentUser = response.body;
    delete currentUser.updatedAt;
    const response2 = await tester
      .get(api.tasklistReadAll.route)
      .set("Cookie", cookie)
      .expect(200);
    expect(response2.body.tasklists).toEqual([]);
  });
});

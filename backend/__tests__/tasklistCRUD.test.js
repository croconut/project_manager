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

  it("can add a new tasklist", async () => {
    const tasklist = {
      name: "some kinda tasklist",
      description: "yeah it's a nice tasklist am i right?",
    };
    await request(server)
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
    const response = await request(server)
      .get(api.tasklistReadOne.route + currentUser.tasklists[1]._id)
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.tasklist).toEqual(currentUser.tasklists[1]);
  });

  it("can read all tasklists", async () => {
    const response = await request(server)
      .get(api.tasklistReadAll.route)
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.tasklists).toEqual(currentUser.tasklists);
  });

  it("can update a single tasklist", async () => {
    const tasklist = {
      name: "this is my new name lol",
    };
    await request(server)
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
    await request(server)
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
    promises.push(request(server).get(api.tasklistReadAll.route).expect(302));
    promises.push(
      request(server)
        .get(api.tasklistReadOne.route + currentUser.tasklists[0]._id)
        .expect(302)
    );
    promises.push(
      request(server)
        .post(api.tasklistUpdate.route + currentUser.tasklists[0]._id)
        .send({ name: "lol" })
        .expect(302)
    );
    promises.push(
      request(server)
        .post(api.tasklistAdd.route)
        .send({ name: "lmao" })
        .expect(302)
    );
    promises.push(
      request(server)
        .delete(api.tasklistDelete.route + currentUser.tasklists[0]._id)
        .expect(302)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("refuses to add tasklists missing required arguments", async () => {
    const promises = [];
    promises.push(
      request(server)
        .post(api.tasklistAdd.route)
        .send({})
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .post(api.tasklistAdd.route)
        .send({ nae: "lmao" })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .post(api.tasklistAdd.route)
        .send({ name: "" })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .post(api.tasklistAdd.route)
        .send({ name: {} })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .post(api.tasklistAdd.route)
        .send({ description: "lmao" })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
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
      request(server)
        .post(api.tasklistUpdate.route + currentUser.tasklists[0]._id)
        .send({})
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .post(api.tasklistUpdate.route + currentUser.tasklists[0]._id)
        .send({ random: "something not on tasklist queue" })
        .set("Cookie", cookie)
        .expect(400)
    );
    // name or description exist but badly typed
    promises.push(
      request(server)
        .post(api.tasklistUpdate.route + currentUser.tasklists[0]._id)
        .send({ name: {} })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .post(api.tasklistUpdate.route + currentUser.tasklists[0]._id)
        .send({ description: {} })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .post(api.tasklistUpdate.route + currentUser.tasklists[0]._id)
        .send("just like a string here")
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
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
      request(server)
        .delete(api.tasklistDelete.route + "asgoina3333333333")
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      request(server)
        .delete(api.tasklistDelete.route)
        .set("Cookie", cookie)
        .expect(404)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("cannot change tasks through tasklist add / update", async () => {
    const taskname = "some kinda fake task";
    await request(server)
      .post(api.tasklistAdd.route)
      // show that description can be mistyped and still work
      // description will just be it's default
      .send({
        name: "a new tasklist name",
        description: { text: "not real" },
        tasks: [{ name: taskname }, { name: "some other task" }],
      })
      .set("Cookie", cookie)
      .expect(201);
    const response = await getInfo();
    const newTasklist =
      response.body.tasklists[response.body.tasklists.length - 1];
    expect(newTasklist.tasks.length).not.toEqual(2);
    expect(newTasklist.tasks[0].name).not.toEqual(taskname);
    expect(newTasklist.description).toEqual("");
    const newName = "some other name";
    const newDescription = `{ text: "not real" }`;
    const faketasks = [{ name: taskname }, { name: "some other task" }];
    await request(server)
      .post(api.tasklistUpdate.route + newTasklist._id)
      .send({
        name: newName,
        description: newDescription,
        tasks: faketasks,
      })
      .set("Cookie", cookie)
      .expect(204);
    const response2 = await getInfo();
    const newTasklist2 =
      response2.body.tasklists[response2.body.tasklists.length - 1];
    // name and description were changed but task changes were ignored
    expect(newTasklist2.name).toEqual(newName);
    expect(newTasklist2.description).toEqual(newDescription);
    expect(newTasklist2.tasks[0].name).not.toEqual(faketasks[0].name);
    // update current user
    currentUser = response2.body;
    delete currentUser.updatedAt;
  });

  it("query params for update / delete / read get 404'd", async () => {
    const promises = [];
    promises.push(
      request(server)
        .delete(api.tasklistDelete.route + "?id=" + currentUser.tasklists[0]._id)
        .set("Cookie", cookie)
        .expect(404)
    );
    promises.push(
      request(server)
        .post(api.tasklistUpdate.route + "?id=" + currentUser.tasklists[0]._id)
        .send({ name: "decently creatable tasklist" })
        .set("Cookie", cookie)
        .expect(404)
    );
    promises.push(
      request(server)
        .get(api.tasklistReadOne.route + "?id=" + currentUser.tasklists[0]._id)
        .set("Cookie", cookie)
        .expect(404)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("even after deleting all tasklists, get empty tasklist when trying to readall instead of 404", async () => {
    const promises = [];
    currentUser.tasklists.forEach((element) => {
      promises.push(
        request(server)
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
    const response2 = await request(server)
      .get(api.tasklistReadAll.route)
      .set("Cookie", cookie)
      .expect(200);
    expect(response2.body.tasklists).toEqual([]);
  });

  
});

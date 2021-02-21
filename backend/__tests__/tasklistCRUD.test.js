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

  beforeAll(async (done) => {
    const response = await request(server)
      .post(api.registerRouter.route)
      .send(user1)
      .expect(201);
    cookie = response.headers["set-cookie"][1];
    expect(cookie).toBeDefined();
    const response2 = await request(server)
      .get(api.usersPrivateInfo.route)
      .set("Cookie", cookie)
      .expect(200);
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
      .expect(204);
    const response = await request(server)
      .get(api.usersPrivateInfo.route)
      .set("Cookie", cookie)
      .expect(200);
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
    const response = await request(server)
      .get(api.usersPrivateInfo.route)
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.tasklists[1].name).not.toEqual(
      currentUser.tasklists[1].name
    );
    expect(response.body.tasklists[1].description).toEqual(currentUser.tasklists[1].description);
    expect(response.body.tasklists[1].name).toEqual(tasklist.name);
    currentUser = response.body;
    delete currentUser.updatedAt;
  });
});

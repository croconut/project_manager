const request = require("supertest");
const api = require("../app/staticData/APIRoutes");

describe("user model can perform CRUD ops", () => {
  const registerRoute = api.registerRouter.route;
  // this route gets redirected when not logged in
  const loginCheckRoute = api.usersPrivateInfo.route;
  const updateRoute = api.usersUpdate.route;
  // user that changes over course of CRUD ops
  let user1 = {
    email: "blah@mail",
    username: "some-username",
    password: "noonecaresabout432PASSword",
  };
  // some other user we wont be modifying
  const user2 = {
    email: "blargh@mailer",
    username: "another-name",
    password: "noonecaresabout33432PASSword",
  };

  // going to register in first test function then
  // use that cookie for every other operation
  let cookie;
  let currentUser;

  // can create user is essentially checked here
  beforeAll(async (done) => {
    await request(server)
      .post(registerRoute)
      .send(user2)
      .expect(201);
    const response = await request(server)
      .post(registerRoute)
      .send(user1)
      .expect(201);
    cookie = response.headers["set-cookie"][1];
    expect(cookie).toBeDefined();
    done();
  });

  it("can read user information", async (done) => {
    const response = await request(server)
      .get(loginCheckRoute)
      .set("Cookie", cookie)
      .expect(200);
    currentUser = response.body;
    delete currentUser.updatedAt;
    expect(currentUser).toHaveProperty("email", user1.email);
    expect(currentUser).toHaveProperty("username", user1.username);
    expect(currentUser).toHaveProperty("tasklists");
    const tasklists = currentUser["tasklists"];
    // ensure user is initialized with one tasklist with one task
    expect(tasklists.length).toEqual(1);
    // ensure tasklist has required subdoc array
    expect(tasklists[0].tasks.length).toEqual(1);
    // ensure tasklist has required information
    expect(tasklists[0]).toHaveProperty("name");
    // ensure task has the important information
    const task = tasklists[0].tasks[0];
    expect(task).toHaveProperty("name");
    expect(task).toHaveProperty("description");
    expect(task).toHaveProperty("stage");
    expect(task).toHaveProperty("assignedUsername");
    // ensure other user default properties exist
    expect(currentUser).toHaveProperty("icon");
    expect(currentUser).toHaveProperty("color");
    const password = currentUser["password"];
    expect(password).toBeUndefined();

    done();
  });

  it("cannot update user with empty obj (nothing changes)", async (done) => {
    await request(server)
      .post(updateRoute)
      .set("Cookie", cookie)
      .send({ user: {} })
      .expect(204);
    const response = await request(server)
      .get(loginCheckRoute)
      .set("Cookie", cookie)
      .expect(200);
    let userCheck = response.body;
    delete userCheck.updatedAt;
    expect(userCheck).toEqual(currentUser);
    done();
  });

  it("cannot update user with obj with incorrect properties", async (done) => {
    await request(server)
      .post(updateRoute)
      .set("Cookie", cookie)
      .send({ user: { blargh: "help" } })
      .expect(204);
    const response = await request(server)
      .get(loginCheckRoute)
      .set("Cookie", cookie)
      .expect(200);
    let userCheck = response.body;
    delete userCheck.updatedAt;
    expect(userCheck).toEqual(currentUser);
    done();
  });

  it("can update user with obj with mix of valid / invalid properties", async (done) => {
    let newName = "pelican";
    await request(server)
      .post(updateRoute)
      .set("Cookie", cookie)
      .send({ user: { blargh: "help", username: newName } })
      .expect(204);

    const response = await request(server)
      .get(loginCheckRoute)
      .set("Cookie", cookie)
      .expect(200);
    let userCheck = response.body;
    delete userCheck.updatedAt;
    expect(userCheck.username).toEqual(newName);
    expect(userCheck).not.toHaveProperty("blargh");
    // success, update user1 and currentuser information
    user1.username = newName;
    currentUser = userCheck;
    done();
  });

  // it("cannot update with a taken username and / or email");
  // it("can update with mix of valid / invalid properties");
});

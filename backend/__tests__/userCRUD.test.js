const request = require("supertest");
const User = require("../app/models/user.model");
const api = require("../app/staticData/Routes");

describe("user model can perform CRUD ops", () => {

  const registerRoute = api.registerRouter.route;
  const loginRoute = api.loginRouter.route;
  // this route gets redirected when not logged in
  const loginCheckRoute = api.usersPrivateInfo.route;
  const updateRoute = api.usersUpdate.route;
  const searchRoute = api.usersSearch.route;
  const passwordResetRoute = api.usersPasswordReset.route;

  const neverShownInfo = (user) => {
    expect(user).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("passwordReset");
    expect(user).not.toHaveProperty("passwordResetTime");
  };

  const getInfo = async () => {
    return await tester
      .get(loginCheckRoute)
      .set("Cookie", cookie)
      .expect(200);
  };

  const checkUnchanged = async (currentUser) => {
    const response = await getInfo();
    let userCheck = response.body;
    delete userCheck.updatedAt;
    expect(userCheck).toEqual(currentUser);
  };

  const updateUser = (jsonObj, expect) => {
    return tester
      .post(updateRoute)
      .set("Cookie", cookie)
      .send(jsonObj)
      .expect(expect);
  };

  const passwordResetTokenCreateMock = async (
    passwordReset,
    createTime,
    callback
  ) => {
    // this doesn't go through validation methods i think
    await User.updateOne(
      { username: user1.username },
      { passwordReset: passwordReset, passwordResetTime: createTime },
      { lean: true },
      callback
    );
  };
  // user that changes over course of CRUD ops
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
  // some other user we wont be modifying
  const user2 = {
    email: "blargh@emailer.co.uk",
    username: "another-name",
    password: "noonecaresabout33432PASSword",
  };

  // going to register in first test function then
  // use that cookie for every other operation
  let cookie;
  let currentUser;
  let tester;

  // can create user is essentially checked here
  beforeAll(async (done) => {
    tester = request(server);
    await tester.post(registerRoute).send(user2).expect(201);
    const response = await tester
      .post(registerRoute)
      .send(user1)
      .expect(201);
    cookie = response.headers["set-cookie"][1];
    expect(cookie).toBeDefined();
    currentUser = response.body.user;
    delete currentUser.updatedAt;
    done();
  });

  it("can read user information", async (done) => {
    expect(currentUser).toHaveProperty("email", user1.email);
    expect(currentUser).toHaveProperty("username", user1.username);
    expect(currentUser).toHaveProperty("tasklists");
    const tasklists = currentUser["tasklists"];
    // ensure user is initialized with one tasklist with one task
    expect(tasklists.length).toEqual(1);
    // ensure tasklist has required subdoc array
    expect(tasklists[0].tasks.length).toEqual(6);
    // ensure tasklist has required information
    expect(tasklists[0]).toHaveProperty("name");
    // ensure task has the important information
    const task = tasklists[0].tasks[0];
    expect(task).toHaveProperty("name");
    expect(task).toHaveProperty("description");
    expect(task).toHaveProperty("assignedUsername");
    expect(task).toHaveProperty("assignedUserIcon");
    // ensure other user default properties exist
    expect(currentUser).toHaveProperty("icon");
    expect(currentUser).toHaveProperty("color");
    const password = currentUser["password"];
    expect(password).toBeUndefined();

    done();
  });

  it("cannot view password related info for logged-in user", async (done) => {
    const response = await tester
      .get(loginCheckRoute)
      .set("Cookie", cookie)
      .expect(200);
    let user = response.body;
    delete user.updatedAt;
    neverShownInfo(user);
    done();
  });

  it("cannot view email, tasklists or password info of other users", async (done) => {
    const response = await tester
      .get(searchRoute + "/" + user2.username)
      .set("Cookie", cookie)
      .expect(200);
    let user = response.body;
    delete user.updatedAt;
    // can't see anything the actual user wouldn't be able to
    neverShownInfo(user);
    // ensuring we actually pulled the user and username out
    expect(user.username).toEqual(user2.username);
    expect(user).not.toHaveProperty("email");
    expect(user).not.toHaveProperty("tasklists");
    done();
  });

  it("cannot update user with crap arguments", async (done) => {
    const promises = [];

    promises.push(updateUser({ user: {} }, 400));
    promises.push(updateUser({}, 400));
    promises.push(updateUser({ user: "hey this is cool right?" }, 400));
    promises.push(updateUser({ user: null }, 400));
    await Promise.all(promises);
    await checkUnchanged(currentUser);
    done();
  });

  it("cannot update user with obj with incorrect properties", async (done) => {
    // returns a valid update, but it didnt change since blargh isn't in the model
    await updateUser({ user: { blargh: "help" } }, 204);
    await checkUnchanged(currentUser);
    done();
  });

  it("can update user with obj with mix of valid / invalid properties", async (done) => {
    let newName = "pelican";
    await updateUser({ user: { blargh: "help", username: newName } }, 204);
    const response = await getInfo();
    let userCheck = response.body;
    delete userCheck.updatedAt;
    expect(userCheck.username).toEqual(newName);
    expect(userCheck).not.toHaveProperty("blargh");
    // success, update user1 and currentuser information
    user1.username = newName;
    currentUser = userCheck;
    done();
  });

  it("cannot update with a taken username and / or email", async (done) => {
    const promises = [];
    // returns forbidden cuz its trying to set password too
    promises.push(updateUser({ user: user2 }, 403));
    promises.push(
      updateUser(
        { user: { username: user2.username, email: user2.email } },
        400
      )
    );
    promises.push(updateUser({ user: { username: user2.username } }, 400));
    promises.push(updateUser({ user: { email: user2.email } }, 400));
    promises.push(
      updateUser(
        { user: { email: user2.email, icon: "fas fa-air-freshener" } },
        400
      )
    );
    promises.push(
      updateUser(
        {
          user: { username: user2.username, icon: "fas fa-air-freshener" },
        },
        400
      )
    );
    await Promise.all(promises);
    await checkUnchanged(currentUser);
    done();
  });

  it("cannot update username or email to invalid values", async (done) => {
    const promises = new Array();
    promises.push(updateUser({ user: { username: "bad$symbol" } }, 400));
    promises.push(updateUser({ user: { email: "badmail" } }, 400));
    await Promise.all(promises);
    await checkUnchanged(currentUser);
    done();
  });

  it("cannot update the password without an email-generated token", async (done) => {
    const newPassword = "apgoisPSGIanepi2in233709a8adagPOGIN";
    await updateUser({ user: { password: newPassword } }, 403);
    // there shouuuuld have been no changes and should return 200, login okay
    await tester.post(loginRoute).send(user1).expect(200);
    done();
  });

  it("logs out other sessions when password has been changed", async (done) => {
    const newPassword = "apgoisPSGIanepi2in233709a8adagPOGIN";
    const passwordReset = "justatokenthatimmocking";
    const createTime = Date.now();
    // essentially a mock of the password reset system
    passwordResetTokenCreateMock(
      passwordReset,
      createTime,
      async (err, doc) => {
        expect(!err).toEqual(true);
        expect(doc).toBeDefined();
        await tester
          .post(passwordResetRoute)
          .send({
            username: user1.username,
            token: passwordReset,
            password: newPassword,
          })
          .expect(204);
        // should be incapable of logging in with old password
        const promises = new Array(2);
        promises[0] = tester.post(loginRoute).send(user1).expect(403);
        // should be incapable of viewing information with an old session
        // and redirects to login
        promises[1] = tester
          .get(loginCheckRoute)
          .set("Cookie", cookie)
          .expect(302);
        await Promise.all(promises);
        user1.password = newPassword;
        const response = await tester
          .post(loginRoute)
          .send(user1)
          .expect(200);
        cookie = response.headers["set-cookie"][1];
        const response2 = await tester
          .get(loginCheckRoute)
          .set("Cookie", cookie)
          .expect(200);
        // only updated password, this response shouldn't change
        let user = response2.body;
        delete user.updatedAt;
        expect(user).toEqual(currentUser);
        done();
      }
    );
  });

  it("cant reset password with bad or missing parameters", async (done) => {
    const newPassword = "apgoisPSGIanepi2in233709a8adagPOGIN";
    const passwordReset = "someKINDATOKENorsomethingitDONTMATTER";
    const createTime = Date.now();

    const resetRequest = (jsonObj, expect) => {
      return tester
        .post(passwordResetRoute)
        .send(jsonObj)
        .expect(expect);
    };
    // essentially a mock of the password reset system
    passwordResetTokenCreateMock(
      passwordReset,
      createTime,
      async (err, doc) => {
        expect(!err).toEqual(true);
        expect(doc).toBeDefined();
        const promises = [];
        promises.push(
          resetRequest(
            {
              username: user1.username,
              token: "totallyFAKE",
              password: newPassword,
            },
            403
          )
        );
        promises.push(
          resetRequest(
            {
              username: "totallyFAKE",
              token: "totallyFAKE",
              password: newPassword,
            },
            400
          )
        );
        promises.push(
          resetRequest(
            {
              username: user1.username,
              password: newPassword,
            },
            400
          )
        );
        promises.push(
          resetRequest(
            {
              token: passwordReset,
              password: newPassword,
            },
            400
          )
        );
        promises.push(
          resetRequest(
            {
              username: user1.username,
              token: passwordReset,
            },
            400
          )
        );
        promises.push(
          resetRequest(
            {
              username: user1.username,
              token: passwordReset,
              password: "notGOODenoughtopassvalidation",
            },
            400
          )
        );
        promises.push(
          resetRequest(
            {
              username: user1.username,
              token: passwordReset,
              password: "notGOODen6632",
            },
            400
          )
        );
        promises.push(
          resetRequest(
            {
              username: "totallyFAKE",
              token: passwordReset,
              password: newPassword,
            },
            400
          )
        );
        promises.push(resetRequest({ password: newPassword }, 400));
        promises.push(resetRequest({ token: passwordReset }, 400));
        promises.push(resetRequest({ username: user1.username }, 400));
        promises.push(resetRequest({ token: passwordReset }, 400));

        await Promise.all(promises);
        done();
      }
    );
  });
});

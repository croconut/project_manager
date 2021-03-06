const request = require("supertest");
const api = require("../app/staticData/Routes");

// consumes global server variable

// does not test user model validation
describe("registration, login, logout", () => {

  const loginRoute = api.loginRouter.route;
  // this route always causes a redirect
  const logoutRoute = api.logoutRouter.route;
  const registerRoute = api.registerRouter.route;
  // this route gets redirected when not logged in
  const loginCheckRoute = api.usersPrivateInfo.route;
  const user1 = {
    email: "blah@mail.com",
    username: "some-username",
    password: "noonecaresabout432PASSword",
  };
  const badPassword = user1.password + "fake";
  const user1AltEmail = {
    email: "blahg@mail.com",
    username: "some-username",
    password: "noonecaresabout432PASSword",
  };
  const user1AltUsername = {
    email: "blah@mail.com",
    username: "some-user",
    password: "noonecaresabout432PASSword",
  };

  const user2 = {
    email: "find@fakemail.com",
    username: "THIS-_",
    password: "alsodecenteventhoughitsalllowercaseletterscuzitslongaf",
    emailBad: "@bad",
    usernameBad: "illegal+character",
    passwordBad: "BlecH$232",
    emailBad2: "bad@something",
    usernameBad2: "s.pecialchars__bad",
    passwordBad2: "LEECHie",
  };

  let tester;

  beforeAll(() => {
    tester = request(server);
  })

  it("can't login to account that doesn't exist", async (done) => {
    await tester.post(loginRoute).send(user1).expect(403);
    done();
  });

  it("can't register accounts with missing information", async (done) => {
    // checking every dropped combination possible for userdata
    const promises = new Array(7);
    promises[0] = tester
      .post(registerRoute)
      .send({
        username: user1.username,
        email: user1.email,
        // password: user1.password,
      })
      .expect(400);
    promises[1] = tester
      .post(registerRoute)
      .send({
        username: user1.username,
        // email: user1.email,
        password: user1.password,
      })
      .expect(400);
    promises[2] = tester
      .post(registerRoute)
      .send({
        // username: user1.username,
        email: user1.email,
        password: user1.password,
      })
      .expect(400);
    promises[3] = tester
      .post(registerRoute)
      .send({
        // username: user1.username,
        // email: user1.email,
        password: user1.password,
      })
      .expect(400);
    promises[4] = tester
      .post(registerRoute)
      .send({
        username: user1.username,
        // email: user1.email,
        // password: user1.password,
      })
      .expect(400);
    promises[5] = tester
      .post(registerRoute)
      .send({
        // username: user1.username,
        email: user1.email,
        // password: user1.password,
      })
      .expect(400);
    promises[6] = tester
      .post(registerRoute)
      .send({
        // username: user1.username,
        // email: user1.email,
        // password: user1.password,
      })
      .expect(400);
    await Promise.all(promises);
    done();
  });

  it("denies username that fail validation", async (done) => {
    const unusedEmail = "aogina@something";
    const promises = new Array(5);
    promises[0] = tester
      .post(registerRoute)
      .send({ username: "agoo.33", email: unusedEmail, password: unusedEmail })
      .expect(400);
    promises[1] = tester
      .post(registerRoute)
      .send({ username: "$agoo33", email: unusedEmail, password: unusedEmail })
      .expect(400);
    promises[2] = tester
      .post(registerRoute)
      .send({
        username: "DROP TABLES",
        email: unusedEmail,
        password: unusedEmail,
      })
      .expect(400);
    promises[3] = tester
      .post(registerRoute)
      .send({
        username: "soemthign;",
        email: unusedEmail,
        password: unusedEmail,
      })
      .expect(400);
    promises[4] = tester
      .post(registerRoute)
      .send({
        username: "heywhatup;DROP tables",
        email: unusedEmail,
        password: unusedEmail,
      })
      .expect(400);
    await Promise.all(promises);
    done();
  });

  it("can register a well formed request without db matches and gives login cookie", async (done) => {
    // these requests cannot be run in parallel
    const res = await tester.post(registerRoute).send(user1);
    expect(res.statusCode).toEqual(201);
    // console.log(res.headers);
    //should also be setting a cookie
    const cookie = res.headers["set-cookie"];
    expect(cookie).toBeDefined();
    // has cookie array with the unset previous cookie, then the set current cookie :>
    expect(cookie.length).toEqual(2);
    const response2 = await tester
      .get("/api/users/myinfo")
      .set("Cookie", cookie[1]);
    // can view our information but not the password
    expect(response2.body.username).toEqual(user1.username);
    expect(response2.body.email).toEqual(user1.email);
    expect(response2.body.password).toBeUndefined();
    done();
  });

  it("cannot register a well formed request with username and/or email db match", async (done) => {
    const promises = new Array(3);
    promises[0] = tester.post(registerRoute).send(user1).expect(409);
    promises[1] = tester
      .post(registerRoute)
      .send(user1AltEmail)
      .expect(409);
    promises[2] = tester
      .post(registerRoute)
      .send(user1AltUsername)
      .expect(409);
    await Promise.all(promises);
    done();
  });
  // lots of tests for these to ensure when we're missing stuff in our body, the server
  // doesn't throw errors
  it("cannot login with bad / missing credentials", async (done) => {
    const promises = new Array(9);
    promises[0] = tester
      .post(loginRoute)
      .send({
        username: user1AltUsername.username,
        password: user1.password,
      })
      .expect(403);
    promises[1] = tester
      .post(loginRoute)
      .send({
        email: user1AltEmail.email,
        password: user1.password,
      })
      .expect(403);
    promises[2] = tester
      .post(loginRoute)
      .send({
        email: user1.email,
        password: badPassword,
      })
      .expect(403);
    promises[3] = tester
      .post(loginRoute)
      .send({
        username: user1.username,
        password: badPassword,
      })
      .expect(403);
    promises[4] = tester
      .post(loginRoute)
      .send({
        username: user1.username,
        email: user1.email,
      })
      .expect(401);
    promises[5] = tester
      .post(loginRoute)
      .send({
        username: user1.username,
      })
      .expect(401);
    promises[6] = tester
      .post(loginRoute)
      .send({
        email: user1.email,
      })
      .expect(401);
    promises[7] = tester
      .post(loginRoute)
      .send({
        password: user1.password,
      })
      .expect(401);
    promises[8] = tester.post(loginRoute).send({}).expect(401);
    await Promise.all(promises);
    done();
  });

  it("doesn't give valid cookie on invalid login", async (done) => {
    const response = await tester.post(loginRoute).send({
      username: user1.username,
      password: badPassword,
    });
    // the cookie it should be setting is a delete your cookie kinda cookie
    const cookie = response.headers["set-cookie"];
    expect(cookie).toBeDefined();
    expect(cookie.length).toEqual(1);
    await tester
      .get(loginCheckRoute)
      .set("Cookie", cookie[0])
      .expect(302);
    done();
  });

  it("redirects logout if not logged in", async (done) => {
    await tester.post(logoutRoute).expect(302);
    done();
  });

  it("properly logs out a logged in user", async (done) => {
    const response = await tester
      .post(loginRoute)
      .send(user1)
      .expect(200);
    const cookie = response.headers["set-cookie"];
    await tester
      .post(logoutRoute)
      .set("Cookie", cookie[1])
      .expect(302);
    // using the previously valid login cookie should cause the redirect
    await tester
      .get(loginCheckRoute)
      .set("Cookie", cookie[1])
      .expect(302);
    done();
  });

  it("cannot register with invalid username, email or password", async (done) => {
    // its faster but possibly too error prone to use indexes instead of 
    // pushing for this use case
    const promises = new Array();
    promises.push(
      tester
        .post(registerRoute)
        .send({
          username: user2.username,
          email: user2.emailBad,
          password: user2.password,
        })
        .expect(400)
    );
    promises.push(
      tester
        .post(registerRoute)
        .send({
          username: user2.usernameBad,
          email: user2.email,
          password: user2.password,
        })
        .expect(400)
    );
    promises.push(
      tester
        .post(registerRoute)
        .send({
          username: user2.username,
          email: user2.email,
          password: user2.passwordBad,
        })
        .expect(400)
    );
    promises.push(
      tester
        .post(registerRoute)
        .send({
          username: user2.username,
          email: user2.emailBad2,
          password: user2.password,
        })
        .expect(400)
    );
    promises.push(
      tester
        .post(registerRoute)
        .send({
          username: user2.usernamebad2,
          email: user2.email,
          password: user2.password,
        })
        .expect(400)
    );
    promises.push(
      tester
        .post(registerRoute)
        .send({
          username: user2.username,
          email: user2.email,
          password: user2.passwordBad2,
        })
        .expect(400)
    );
    await Promise.all(promises);
    done();
  });

  it("can register user2", async done => {
    const promises = new Array();
    promises.push(
      tester
        .post(registerRoute)
        .send(user2)
        .expect(201)
    );
    await Promise.all(promises);
    done();
  });

});

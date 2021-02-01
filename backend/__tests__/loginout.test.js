const request = require("supertest");

// consumes global server variable

describe("login and out", () => {

  const user1 = {
    email: "blah@mail",
    username: "some-username",
    password: "noonecaresabout432PASSword",
  };
  const user1AltEmail = {
    email: "blahg@mail",
    username: "some-username",
    password: "noonecaresabout432PASSword",
  };
  const user1AltUsername = {
    email: "blah@mail",
    username: "some-user",
    password: "noonecaresabout432PASSword",
  };

  it("can't login to fake account", async (done) => {
    const res = await request(server)
      .post("/api/login")
      .send({
        password: "blah",
        email: "fake",
        username: "unreal",
      })
      .set("Accept", "application/json");
    // console.log(res.headers);
    expect(res.statusCode).toEqual(403);
    done();
  });

  it("can't register accounts with missing information", async (done) => {
    // checking every dropped combination possible for userdata
    let res = await request(server).post("/api/register").send({
      username: user1.username,
      email: user1.email,
      // password: user1.password,
    });
    expect(res.statusCode).toEqual(403);
    res = await request(server).post("/api/register").send({
      username: user1.username,
      // email: user1.email,
      password: user1.password,
    });
    expect(res.statusCode).toEqual(403);
    res = await request(server).post("/api/register").send({
      // username: user1.username,
      email: user1.email,
      password: user1.password,
    });
    expect(res.statusCode).toEqual(403);
    res = await request(server).post("/api/register").send({
      // username: user1.username,
      // email: user1.email,
      password: user1.password,
    });
    expect(res.statusCode).toEqual(403);
    res = await request(server).post("/api/register").send({
      username: user1.username,
      // email: user1.email,
      // password: user1.password,
    });
    expect(res.statusCode).toEqual(403);
    res = await request(server).post("/api/register").send({
      // username: user1.username,
      email: user1.email,
      // password: user1.password,
    });
    expect(res.statusCode).toEqual(403);
    res = await request(server).post("/api/register").send({
      // username: user1.username,
      // email: user1.email,
      // password: user1.password,
    });
    expect(res.statusCode).toEqual(403);
    done();
  });

  it("can register a well formed request without db matches", async (done) => {
    const res = await request(server).post("/api/register").send(user1);
    expect(res.statusCode).toEqual(201);
    // console.log(res.headers);
    //should also be setting a cookie
    const cookie = res.headers["set-cookie"];
    expect(cookie).toBeDefined();
    // has cookie array with the unset previous cookie, then the set current cookie :>
    expect(cookie.length).toEqual(2);
    const response2 = await request(server).get("/api/users/myinfo").set('Cookie', cookie[1]);
    // can view our information but not the password
    expect(response2.body.username).toEqual(user1.username);
    expect(response2.body.email).toEqual(user1.email);
    expect(response2.body.password).toBeUndefined();
    done();
  });

  it("cannot register a well formed request with username and/or email db match", async (done) => {
    let res = await request(server).post("/api/register").send(user1);
    expect(res.statusCode).toEqual(403);
    res = await request(server).post("/api/register").send(user1AltEmail);
    expect(res.statusCode).toEqual(403);
    res = await request(server).post("/api/register").send(user1AltUsername);
    expect(res.statusCode).toEqual(403);
    done();
  });
});

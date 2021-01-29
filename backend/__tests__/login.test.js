const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const { createHttpTerminator } = require("http-terminator");
const connect = require("../connect");

let server;
let store;
let manager;

beforeAll(async () => {
  let app2 = await connect(app);
  store = app2.store;
  server = await app2.app.listen(process.env.PORT_TEST);
  manager = createHttpTerminator({ gracefulTerminationTimeout: 100, server });
});

afterAll(async done => {
  console.log("closing server...");
  // gotta disconnect from the store, mongoose and 
  await mongoose.disconnect();
  await store.client.close();
  await manager.terminate();
  done();
});

describe("Post Endpoints", () => {
  it("should create a new post", async () => {
    const res = await request(server).get("/");
    expect(res.statusCode).toEqual(200);
  });
});

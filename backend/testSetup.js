const mongoose = require("mongoose");
const app = require("./app/app");
const { createHttpTerminator } = require("http-terminator");
const connect = require("./app/connect");

// creates globals ==> store, server, manager (store is specifically for sessions)

beforeAll(async () => {
  let app2 = await connect(app);
  global.store = app2.store;
  global.server = await app2.app.listen(process.env.PORT_TEST);
  global.manager = createHttpTerminator({
    gracefulTerminationTimeout: 1000,
    server,
  });

});

afterAll(async (done) => {
  // gotta disconnect from the store, mongoose then terminate the application
  const closeM = manager.terminate();
  const closeS = store.client.close();
  const close = mongoose.connection.close();
  await close;
  await closeM;
  await closeS;
  done();
});

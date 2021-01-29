const connect = require("./connect");
const { createHttpTerminator } = require("http-terminator");
const mongoose = require("mongoose");
const app = require("./app");

const startServer = async () => {
  const port = process.env.PORT || 5000;
  const appStore = await connect(app);
  const server = appStore.app.listen(port);
  const shutdownManager = createHttpTerminator({server});
  process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    await appStore.store.client.close();
    shutdownManager.terminate();
  });
};

startServer();
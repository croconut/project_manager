const connect = require("./app/connect");
const { createHttpTerminator } = require("http-terminator");
const mongoose = require("mongoose");
const app = require("./app/app");

const startServer = async () => {
  const port = process.env.PORT || 5000;
  const isTesting = process.env.NODE_ENV === "test";
  const appStore = await connect(app);
  const server = appStore.app.listen(port);
  const shutdownManager = createHttpTerminator({ server });
  // app gracefully shuts down
  const terminateHandle = async () => {
    await shutdownManager.terminate();
    await mongoose.connection.close();
    await appStore.store.client.close();
    process.exit();
  };
  process.on("SIGTERM", terminateHandle);
  process.on("SIGINT", terminateHandle);
};

startServer();

const connect = require("./app/connect");
const { createHttpTerminator } = require("http-terminator");
const mongoose = require("mongoose");
const app = require("./app/app");

const startServer = async () => {
  const port = process.env.PORT || 5000;
  const appStore = await connect(app);
  const server = appStore.app.listen(port);
  const shutdownManager = createHttpTerminator({ server });
  // app gracefully shuts down
  const terminateHandle = async () => {
    const closeM = shutdownManager.terminate();
    const closeS = appStore.store.client.close();
    const close = mongoose.connection.close();
    await close;
    await closeM;
    await closeS;
  };
  process.on("SIGTERM", terminateHandle);
  process.on("SIGINT", terminateHandle);
};

startServer();

const connect = require("./app/connect");
const { createHttpTerminator } = require("http-terminator");
const mongoose = require("mongoose");
const app = require("./app/app");
const https = require("https");
const fs = require("fs");

const startServer = async () => {
  const port = process.env.PORT || 5000;
  const appStore = await connect(app);
  let server;
  if (process.env.HTTPS === "true")
    server = https
      .createServer(
        {
          key: fs.readFileSync(process.env.KEYFILE),
          cert: fs.readFileSync(process.env.CERTFILE),
        },
        appStore.app
      )
      .listen(port);
  else {
    server = appStore.app.listen(port);
  }
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

const connect = require("./app/connect");
const { createHttpTerminator } = require("http-terminator");
const mongoose = require("mongoose");
const app = require("./app/app");
const https = require("https");
const fs = require("fs");

const startServer = async () => {
  const port = process.env.PORT || 5000;
  const port2 = process.env.HTTP_PORT || port;
  const appStore = await connect(app);
  if (process.env.HTTPS === "true") {
    const httpsServer = https
      .createServer(
        {
          key: fs.readFileSync(process.env.KEYFILE),
          cert: fs.readFileSync(process.env.CERTFILE),
        },
        appStore.app
      )
      .listen(port);
    const shutdownManagerHTTPS = createHttpTerminator({ server: httpsServer });
    // app gracefully shuts down
    const terminateHandleHTTPS = async () => {
      const closeM = shutdownManagerHTTPS.terminate();
      const closeS = appStore.store.client.close();
      const close = mongoose.connection.close();
      await close;
      await closeM;
      await closeS;
    };
    process.on("SIGTERM", terminateHandleHTTPS);
    process.on("SIGINT", terminateHandleHTTPS);
  }

  const httpServer = appStore.app.listen(port2);

  const shutdownManager = createHttpTerminator({ server: httpServer });
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

// set the enviroment to development,test or production
import * as config from "./utils/config.js";

// import local modules
import { connectToMongo } from "./utils/mongo.js";

// import app
import app from "./app.js";

// import http module
import http from "http";
const server = http.createServer(app);

// run the server
connectToMongo().then(() => {
  const PORT = config.PORT || 3003;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// set the enviroment to development,test or production
const config = require("./utils/config");

//import local modules
const { connectToMongo } = require("./utils/mongo");

// import app
const app = require("./app");

// import http module
const http = require("http");
const server = http.createServer(app);

// run the server
connectToMongo().then(() => {
  const PORT = config.PORT || 3003;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

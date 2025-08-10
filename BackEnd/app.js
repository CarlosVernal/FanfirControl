require("dotenv").config(); // get enviroment variables

// import frameworks and libraries
const express = require("express");
const cors = require("cors");
const { errorHandler, unknownEndpoint } = require("./middleware/errorHandler");

//import routes
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");

// use express to create a server
const app = express();

// use middlewares
app.use(cors());
app.use(express.json());

// use routes
app.use("/api", authRouter);
app.use("/api/users", usersRouter);

//testing routes in test environment
if (process.env.NODE_ENV === "test") {
    const testingRouter = require("./routes/testing");
    console.log(process.env.NODE_ENV, "enviroment enabled");
    app.use("/api/testing", testingRouter);
}

// handle errors
app.use(errorHandler);
app.use(unknownEndpoint);

// export the app for testing
module.exports = app;

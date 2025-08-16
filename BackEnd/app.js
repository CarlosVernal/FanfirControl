require("dotenv").config(); // get enviroment variables

// import frameworks and libraries
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { errorHandler, unknownEndpoint } = require("./middleware/errorHandler");

//import routes
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const budgetsRouter = require("./routes/budgets");
const categoryRouter = require("./routes/categorys");
const mountsReportRouter = require("./routes/mountReports");
const transactionRouter = require("./routes/transactions");

// use express to create a server
const app = express();

// use middlewares
app.use(cors());
app.use(express.json());

app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later."
}));


// use routes
app.use("/api", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/budgets", budgetsRouter);
app.use("/api/category", categoryRouter);
app.use("/api/mounts", mountsReportRouter);
app.use("/api/transactions", transactionRouter);

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

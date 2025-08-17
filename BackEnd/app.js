import "dotenv/config"; // get enviroment variables

// import frameworks and libraries
import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { errorHandler, unknownEndpoint } from "./middleware/errorHandler.js";

// import routes
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import budgetsRouter from "./routes/budgets.js";
import categoryRouter from "./routes/categorys.js";
import mountsReportRouter from "./routes/mountReports.js";
import transactionRouter from "./routes/transactions.js";

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
    const { default: testingRouter } = await import("./routes/testing.js");
    console.log(process.env.NODE_ENV, "enviroment enabled");
    app.use("/api/testing", testingRouter);
}

// handle errors
app.use(errorHandler);
app.use(unknownEndpoint);

// export the app for testing
export default app;

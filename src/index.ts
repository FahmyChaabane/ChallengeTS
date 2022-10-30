import { errorMiddleware } from "./middlewares/errorMiddleware";
import express, { Express } from "express";
import { connect } from "mongoose";
import User from "./routes/user";
import Hobby from "./routes/hobby";
import "./models/hobby.schema";
import "./models/user.schema";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";
import { Server } from "http";

const app: Express = express();

connect("mongodb://localhost:27017/test")
  .then(() => {
    console.log("database connected!");
  })
  .catch((error) => {
    console.error(error);
  });

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/user", User);
app.use("/api/hobby", Hobby);

app.use(errorMiddleware);

const server: Server = app.listen(4000, () => {
  console.log("The application is listening on port 4000!");
});

export default server;

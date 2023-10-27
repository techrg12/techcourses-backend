import express from "express";
import { config } from "dotenv";
import ErrorMiddleware from "./middlewares/error.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

config({
  path: "./config/config.env",
});
var corsoption = {
  origin: "http://localhost:3001", //origin from where you requesting
  credentials: true,
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
}
//using cors
app.use(cors(corsoption));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))
app.use(cookieParser());

//importing and using routing

import publicRoutes from "./routes/publicRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

app.use("/api/v1", publicRoutes);
app.use("/api/v1/admin", adminRouter)


export default app;

app.use(ErrorMiddleware);

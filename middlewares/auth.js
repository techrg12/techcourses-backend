import jwt from "jsonwebtoken";
import { CatchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/userModel.js";

export const isAuthenticated = CatchAsyncError(async (req, resp, next) => {

  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("not_loggedin", 401));
  } else {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decode._id);
    next();
  }
});

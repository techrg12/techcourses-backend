import express from "express";
import {
    addCourses,
    addLesson,
    deleteCourse,
    deleteLesson,
    getAllCourses,
    getAllLessons,
    getSingleCourse,
    getSingleLesson,
    updateCourse,
    updateLesson
} from "../controllers/adminControllers.js";
import singleUpload from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";


const adminRouter = express.Router();

adminRouter.route("/course").post(isAuthenticated, singleUpload, addCourses)
adminRouter.route("/courses").get(isAuthenticated, getAllCourses)
adminRouter.route("/course/:_id").get(isAuthenticated, getSingleCourse)
adminRouter.route("/course").put(singleUpload, isAuthenticated, updateCourse)
adminRouter.route("/course/:_id").delete(isAuthenticated, deleteCourse)

adminRouter.route("/lessons").get(isAuthenticated, getAllLessons)
adminRouter.route("/lesson").post(isAuthenticated, singleUpload, addLesson)
adminRouter.route("/lesson").get(isAuthenticated, getSingleLesson)
adminRouter.route("/lesson").put(isAuthenticated, singleUpload, updateLesson)
adminRouter.route("/lesson/:_id").delete(isAuthenticated, deleteLesson)

export default adminRouter;
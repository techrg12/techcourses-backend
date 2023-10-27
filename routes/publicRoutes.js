import express from 'express'
import { AddReviews, getCourses, getCoursesFilter, getProfile, login, logout, register, sendRecieveMessage, singelCourse, singelLesson, updateProfile } from '../controllers/publicControllers.js'
import { isAuthenticated } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';

const router = express.Router()

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/me").get(isAuthenticated, getProfile);
router.route("/logout").get(logout);
router.route("/courses").get(getCourses);
router.route("/course/:slug").get(singelCourse);
router.route("/filter/course").get(getCoursesFilter);
router.route("/review").post(isAuthenticated, AddReviews);
router.route("/lesson").get(isAuthenticated, singelLesson);
router.route("/profile").put(isAuthenticated, singleUpload, updateProfile);
router.route("/message").post(isAuthenticated, sendRecieveMessage);

export default router
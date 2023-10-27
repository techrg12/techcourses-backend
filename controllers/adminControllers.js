import { CatchAsyncError } from "../middlewares/catchAsyncError.js"
import { Course } from "../models/courseModel.js"
import { Lesson } from "../models/lessonsModel.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary"

export const getAllCourses = CatchAsyncError(async (req, resp, next) => {
    const courses = await Course.find();
    resp.status(200).json({
        success: true,
        courses
    })

})

export const getSingleCourse = CatchAsyncError(async (req, resp, next) => {
    const getId = req.params?._id;
    const data = await Course.findById(getId);
    if (!data) {
        const error = new ErrorHandler("No data", 401);
        return next(error)
    }
    else {
        resp.status(200).json({
            success: true,
            data
        })
    }

})

export const addCourses = CatchAsyncError(async (req, resp, next) => {

    const { title, description, category, price } = req.body;

    if (!title || !description || !category || !price) {
        const error = new ErrorHandler("all_fields_required", 400)
        return next(error);
    }

    else {
        const data = await Course.findOne({ title })
        if (data) {
            const error = new ErrorHandler("course_already_exist", 409);
            return next(error)
        }

        else {
            const file = req.file
            const fileUri = getDataUri(file);
            const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
            const courses = await Course.create({
                title, description, category, price, sort_by: price === "0" ? "free" : "paid",
                slug: title.toLowerCase().replace(/ /g, '-'), poster: {
                    public_id: mycloud.public_id,
                    url: mycloud.secure_url
                }
            });
            if (!courses) {
                const error = new ErrorHandler("failed_to_create_course", 400)
                return next(error);
            }
            else {
                resp.status(200).json({
                    success: true,
                    message: "courses_created"
                })
            }
        }
    }
})

export const updateCourse = CatchAsyncError(async (req, resp, next) => {
    const cid = req.body.id;
    const data = await Course.findById(cid);
    if (!data) {
        const error = new ErrorHandler("No data match", 401);
        return next(error)
    }
    else {
        const { title, description, category, price } = req.body;
        const file = req.file
        let mycloud;
        if (file) {
            const fileUri = getDataUri(file);
            mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
            var update = await Course.updateOne({ _id: cid }, {
                $set: {
                    title: req.body.title,
                    slug: req.body.title.toLowerCase().replace(/ /g, '-'),
                    description: req.body.description ? req.body.description : description,
                    category: req.body.category ? req.body.category : category,
                    price: req.body.price ? req.body.price : price,
                    poster: {
                        public_id: mycloud.public_id,
                        url: mycloud.secure_url
                    },
                    sort_by: req.body.price === 0 ? "free" : "paid"
                }
            })
        }

        else {
            var update = await Course.updateOne({ _id: cid }, {
                $set: {
                    title: req.body.title,
                    description: req.body.description ? req.body.description : description,
                    category: req.body.category ? req.body.category : category,
                    price: req.body.price ? req.body.price : price,
                }
            })
        }
        if (update) {
            resp.status(201).json({
                message: "Course updated",
                success: true,
                Course
            })
        }
        else {
            return next(new ErrorHandler("not updated", 400))
        }
    }
})

export const deleteCourse = CatchAsyncError(async (req, resp, next) => {
    const getId = req.params?._id;
    const data = await Course.findById(getId);
    if (!data) {
        const error = new ErrorHandler("No data", 401);
        return next(error)
    }
    else {
        const res = await Course.deleteOne({ _id: getId });
        if (res) {
            resp.status(200).json({
                message: "Course deleted successfully",
                success: true
            })
        }
        else {
            let error = new ErrorHandler("Error in deleted", 400);
            return next(error)
        }
    }


})

export const addLesson = CatchAsyncError(async (req, resp, next) => {
    const { title, description, course_name, course_id, extra_video } = req.body
    if (!title || !description || !course_name) {
        return next(new ErrorHandler("all_fields_required", 400))
    }
    else {
        const lesson = await Lesson.findOne({ title, course_id });
        if (lesson) {
            const error = new ErrorHandler("lesson_already_exist", 409);
            return next(error)
        }
        else {
            const file = req.file;
            let cloudFiles
            if (file) {
                const fileUri = getDataUri(file);
                cloudFiles = await cloudinary.v2.uploader.upload(fileUri.content, {
                    resource_type: 'video'
                });
                var data = await Lesson.create({
                    title, description, course_name, course_id, extra_video,
                    slug: title.toLowerCase().replace(/ /g, '-'),
                    lesson_video: {
                        public_id: cloudFiles.secure_url,
                        url: cloudFiles.secure_url
                    }
                })
            }
            else {
                var data = await Lesson.create({
                    title, description, course_name, course_id, extra_video,
                    slug: title.toLowerCase().replace(/ /g, '-'),

                })
            }
            if (data) {
                resp.status(200).json({
                    message: "lesson_created",
                    success: true
                })
            }
            else {
                const error = new ErrorHandler("error_lesson_created", 409);
                return next(error)
            }
        }
    }
})

export const getAllLessons = CatchAsyncError(async (req, resp, next) => {
    const lessons = await Lesson.find();
    resp.status(200).json({
        success: true,
        lessons
    })

})

export const getSingleLesson = CatchAsyncError(async (req, resp, next) => {
    const getId = req.query.id;
    const data = await Lesson.findById(getId);
    if (!data) {
        const error = new ErrorHandler("No data", 401);
        return next(error)
    }
    else {
        resp.status(200).json({
            success: true,
            data
        })
    }

})

export const updateLesson = CatchAsyncError(async (req, resp, next) => {
    const lid = req.body.id;
    const data = await Lesson.findById(lid);
    if (!data) {
        const error = new ErrorHandler("No data match", 401);
        return next(error)
    }
    else {
        const { title, description, course_name, extra_video } = req.body;
        const file = req.file
        let mycloud;
        if (file) {
            const fileUri = getDataUri(file);
            mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
                resource_type: 'video'
            });
            var update = await Lesson.updateOne({ _id: lid }, {
                $set: {
                    title: req.body.title,
                    slug: req.body.title.toLowerCase().replace(/ /g, '-'),
                    description: req.body.description ? req.body.description : description,
                    course_name: req.body.course_name ? req.body.course_name : course_name,
                    extra_video: req.body.extra_video ? req.body.extra_video : extra_video,
                    lesson_video: {
                        public_id: mycloud.public_id,
                        url: mycloud.secure_url
                    }
                }
            })
        }

        else {
            var update = await Lesson.updateOne({ _id: lid }, {
                $set: {
                    title: req.body.title,
                    description: req.body.description ? req.body.description : description,
                    course_name: req.body.course_name ? req.body.course_name : course_name,
                    extra_video: req.body.extra_video ? req.body.extra_video : extra_video,
                }
            })
        }
        if (update) {
            resp.status(201).json({
                message: "Lesson updated",
                success: true,
                Lesson
            })
        }
        else {
            return next(new ErrorHandler("not updated", 400))
        }
    }
})

export const deleteLesson = CatchAsyncError(async (req, resp, next) => {
    const getId = req.params?._id;
    const data = await Lesson.findById(getId);
    if (!data) {
        const error = new ErrorHandler("No data", 401);
        return next(error)
    }
    else {
        const res = await Lesson.deleteOne({ _id: getId });
        if (res) {
            resp.status(200).json({
                message: "lesson_deleted_successfuuly",
                success: true
            })
        }
        else {
            let error = new ErrorHandler("Error in deleted", 400);
            return next(error)
        }
    }


})
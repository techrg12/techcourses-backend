import { CatchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/courseModel.js";
import { Lesson } from "../models/lessonsModel.js";
import { User } from "../models/userModel.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from "cloudinary"

export const register = CatchAsyncError(async (req, resp, next) => {
    const { fname, lname, email, phone, password } = req.body;
    if (!fname || !lname || !email || !phone || !password) {
        const error = new ErrorHandler("Please fill required fields", 400);
        next(error);
    } else if (isNaN(phone)) {
        const error = new ErrorHandler("Invalid phone number", 422);
        next(error);
    } else {
        let users = await User.findOne({ email });
        let checkPhone = await User.findOne({ phone });
        if (users) {
            const error = new ErrorHandler("Email already exist", 409);
            next(error);
        } else if (checkPhone) {
            const error = new ErrorHandler("Phone number already exist", 409);
            next(error);
        } else {
            const user = await User.create({
                fname,
                lname,
                email,
                phone,
                password,
                uid: Math.random().toString(36).slice(2, 10)
            });
            sendToken(resp, user, "User registered successfully", 201, { "status": "new" });
        }
    }
});

export const login = CatchAsyncError(async (req, resp, next) => {

    const { email, password, token } = req.body;

    if (!email || !password) {
        const error = new ErrorHandler("Please fill required fields", 400);
        next(error);
    }

    if (!token) {
        const error = new ErrorHandler("captach.missing", 400);
        next(error);
    }

    else {
        const users = await User.findOne({ email }).select("+password");
        if (!users) {
            return next(new ErrorHandler("User doesn't exist", 400));
        }
        const isMatch = await users.comparePassword(password);

        if (!isMatch) {
            const error = new ErrorHandler("Invalid email or password", 401);
            return next(error);
        } else {
            sendToken(resp, users, "Logged in successfully", 200);
        }
    }
});

export const logout = CatchAsyncError(async (req, resp, next) => {
    resp.status(200).cookie("token", null, {
        expires: new Date(Date.now())
    }).json({
        message: "logout_suc",
        success: true,
    })
})

export const getProfile = CatchAsyncError(async (req, resp, next) => {
    const user = await User.findById(req.user._id);
    // resp.setHeader('Cache-Control', 'no-store');
    if (user) {
        sendToken(resp, user, "Logged in successfully", 200, { "status": "active" });
    }
    else {
        return next(new ErrorHandler("not_logged_in", 400));
    }
})

export const updateProfile = CatchAsyncError(async (req, resp, next) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        const error = new ErrorHandler("no_user_match", 401);
        return next(error)
    }
    else {
        const profilePic = req.file;
        let mycloud;
        if (profilePic) {
            const fileSize = profilePic.size / 1024 / 1024; // in MiB
            if (fileSize > 1) {
                const error = new ErrorHandler("file_size_less", 401);
                return next(error)
            }
            else {
                const fileUri = getDataUri(profilePic);
                mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
                const setProfilePic = await User.updateOne({ _id: req.user._id }, {
                    $set: {
                        avatar: {
                            public_id: mycloud.public_id,
                            url: mycloud.secure_url
                        },
                    }
                })
                if (setProfilePic) {
                    resp.status(201).json({
                        message: "profile_picture_updated",
                        success: true,
                        User
                    })
                }
                else {
                    const error = new ErrorHandler("profile_picture_not_updated", 401);
                    return next(error)
                }
            }
        }
        else {
            const { fname, lname, email, phone, dob, updatedAt, id } = req.body
            console.log(req.user._id, id)
            const res = await User.updateOne({ _id: req.user._id }, {
                $set: {
                    fname, lname, email, phone, dob, updatedAt
                }
            });
            if (res) {
                resp.status(201).json({
                    message: "profile_updated",
                    success: true,
                    User
                })
            }
            else {
                const error = new ErrorHandler("profile_not_updated", 401);
                return next(error)
            }
        }
    }
})

export const getCourses = CatchAsyncError(async (req, resp, next) => {
    const queryFilter = req.query;

    const page = parseInt(req.query.page) || 1; // Current page number
    const perPage = parseInt(req.query.limit) || 2; // Items per page

    const totalCount = await Course.countDocuments(); // Total number of items
    const totalPages = Math.ceil(totalCount / perPage);

    const items = await Course.find()
        .skip((page - 1) * perPage)
        .limit(perPage);
    resp.setHeader("total", totalCount);
    resp.setHeader("per_page", totalPages);

    const courses = await Course.find(queryFilter);
    if (courses) {
        resp.status(200).json({
            success: true,
            pages: totalPages,
            total: totalCount,
            courses: items
        })
    }
    else {
        return next(new ErrorHandler("no_courses_found", 404));
    }

})

export const getCoursesFilter = CatchAsyncError(async (req, resp, next) => {
    const queryFilter = req.query;
    const courses = await Course.find(queryFilter);

    if (courses) {
        resp.status(200).json({
            success: true,
            courses
        })
    }
    else {
        return next(new ErrorHandler("no_courses_found", 404));
    }

})

export const singelCourse = CatchAsyncError(async (req, resp, next) => {
    const slug = req.params.slug
    let course = await Course.findOne({ slug })
    const course_lessons = await Lesson.find({ course_id: course?.id });

    if (course) {
        resp.status(201).json({
            success: true,
            course,
            course_lessons
        })
    }
    else {
        return next(new ErrorHandler("No course found", 404))
    }

})

export const AddReviews = CatchAsyncError(async (req, resp, next) => {

    const { reviews, rating, id, email, fname, slug, uid } = req.body;
    if (!reviews || !rating) {
        const error = new ErrorHandler("all_fields_required", 400)
        return next(error);
    }
    else {
        const checkCourse = await Course.findById({ _id: id });
        if (checkCourse) {
            const existingReview = await Course.findOne({
                reviews: { $elemMatch: { slug, uid } },
            });
            if (existingReview) {
                return next(new ErrorHandler("You already submited the review", 400))
            }
            else {
                let res = await Course.updateOne(
                    { _id: id }, {
                    $push: {
                        reviews: {
                            uid: uid,
                            slug: slug,
                            text: reviews,
                            reviewby: {
                                email: email,
                                name: fname,
                            },
                            rating: rating,
                        },
                    }
                }
                );
                if (res) {
                    await Course.updateOne({ _id: id }, {
                        $set: {
                            reviewsCount: Object.keys(checkCourse.reviews).length + 1
                        }
                    })

                    let checkUpdate = await Course.findById({ _id: id });
                    if (checkUpdate) {
                        let totalRating = checkUpdate.reviews.reduce((acc, obj) => { return acc + obj.rating; }, 0);
                        let totalReviews = checkUpdate.reviewsCount
                        let ratingPercentage = Number(totalRating) / Number(totalReviews);
                        await Course.updateOne({ _id: id }, {
                            $set: {
                                rating_percent: Math.round(ratingPercentage)
                            }
                        })
                    }
                    resp.status(200).json({
                        message: "Review added successfully",
                        success: true
                    })
                }
                else {
                    return next(new ErrorHandler("review_not_added", 400))
                }
            }
        }
    }
})

export const singelLesson = CatchAsyncError(async (req, resp, next) => {
    const slug = req.query.slug;
    const course = req.query.course
    let data = await Lesson.findOne({ slug, course_name: course })
    if (data) {
        resp.status(201).json({
            data,
        })
    }
    else {
        return next(new ErrorHandler("no_lesson", 404))
    }

})

export const sendRecieveMessage = CatchAsyncError(async (req, resp, next) => {

})
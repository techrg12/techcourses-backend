import mongoose from "mongoose";

const schema = mongoose.Schema({

    course_id: {
        type: String
    },
    course_name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 80
    },
    slug: {
        type: String,
    },
    description: {
        type: String,
        required: true,
        minLength: 500,
        maxLength: 5000
    },
    lesson_video: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    extra_video: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }

})

export const Lesson = mongoose.model("Lesson", schema) 
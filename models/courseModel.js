import mongoose from "mongoose";

const schema = new mongoose.Schema({
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
        maxLength: 5000,
    },
    poster: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },

    rating_percent: {
        type: Number,
        default: 0
    },
    sort_by: {
        type: String,
    },
    category: {
        type: String,
        required: true
    },
    reviews: [
        {
            slug: {
                type: String
            },
            uid: {
                type: String
            },
            text: {
                type: String
            },
            reviewby: {
                email: {
                    type: String,
                },
                name: {
                    type: String,
                }
            },
            reviewdate: {
                type: Date,
                default: Date.now
            },
            rating: {
                type: Number,
                default: 0
            }
        }
    ],
    reviewsCount: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

export const Course = mongoose.model("Course", schema)
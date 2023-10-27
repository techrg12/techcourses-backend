import mongoose from "mongoose";

export const connectDb =  async () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Database connected");
    })
    .catch(() => {
        console.log("Database not connected")
    })

}
import app from "./app.js";
import { connectDb } from './config/database.js';
import cloudinary from "cloudinary";
import http from "http";
import cors from "cors";

import { Server } from "socket.io";

connectDb();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
    // Listen for incoming messages
    socket.on('message', (message) => {
        // Broadcast the message to all connected clients
        console.log(message)
        io.emit('message', message);
    });
});

cloudinary.v2.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});

server.listen(process.env.PORT, () => {
    console.log(`connected on ${process.env.PORT}`);
})
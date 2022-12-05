import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);
import { Server } from "socket.io";
import { Board } from "./logic.js";
import UserService from "./uuid.js";

const io = new Server(server, {
    cors: { origin: '*' }
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.once('register', (arg, callback) => {
        let uuid = arg?.uuid;
        if (uuid && UserService.checkUUID(uuid)) {
            UserService.renewUUID(uuid);
        }
        else {
            uuid = UserService.newUUID();
        }
        socket.join(uuid);
        callback(UserService.getUserInfo(uuid));
    });

    socket.on('move', (arg) => {
        let uuid = arg.uuid;
        let uInfo = UserService.getUserInfo(uuid);
        let newGame = Board.move(uuid, uInfo.game, arg.i, arg.j);
        UserService.setGame(uInfo.gameId, newGame);
        UserService.renewUUID(uuid);
    });

    socket.on('disconnect', (reason) => {
        console.log(reason);
    });

    socket.on('new-game', (arg, callback) => {
        UserService.add2Queue(arg.uuid);
        callback(UserService.getUserInfo(arg.uuid));
    });

    socket.on('leave', (arg, callback) => {
        let uuid = arg.uuid;
        UserService.leaveUserFromCurrentGame(uuid);
        callback(UserService.getUserInfo);
    });

    socket.onAny((arg) => {
        let uuid = arg?.uuid;
        if (uuid) {
            UserService.renewUUID(uuid);
        }
    })
});

server.listen(process.env.PORT || 8000, () => {
    console.log("I Socket Server started!");
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

export { io };
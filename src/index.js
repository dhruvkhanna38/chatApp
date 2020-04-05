const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const Filter = require("bad-words");
const {generatedMessage , generatedLocationMessage} = require("../src/utils/messages")
const  {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users");


const app = express();
const server = http.createServer(app);
const io = socketIO(server);


const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname , "../public");

let count =0;

io.on("connection" , (socket)=>{
    console.log("New Websocket Connection");
    // socket.emit("countUpdated", count);

    // socket.on("increment", ()=>{
    //     count++;
    //     //socket.emit("countUpdated" , count);
    //     io.emit("countUpdated" , count);
    // });


    socket.on("join" , ({username , room}, callback)=> {
            const {error, user}= addUser({id:socket.id , username ,  room});
            if(error){
                return callback(error);
            }
            let str = "Welcome "  + user.username + "!!"
            socket.join(user.room);
            socket.emit("message" , generatedMessage("admin", str));
            socket.broadcast.to(user.room).emit("message" , generatedMessage("admin", `${user.username} has joined`));
            io.to(user.room).emit("roomData" ,{
                room : user.room , 
                users : getUsersInRoom(user.room)
            });

            callback();

    });

    socket.on("sendMessage" , (message, callback)=>{
        const user = getUser(socket.id);

        if(!user){
            return callback("User not found");
        }

        const filter = new Filter();

        if(filter.isProfane(message)){
            return callback("Profanity is not allowed");
        }

        io.to(user.room).emit("message" , generatedMessage(user.username,message));
        callback();
    });

    socket.on("sendLocation" , (position , callback)=>{
        //io.emit("message" , `https://google.com/maps?q=${position.latitude},${position.longitude}`);
        const user = getUser(socket.id);


        const url = `https://google.com/maps?q=${position.latitude},${position.longitude}`;
        io.to(user.room).emit("locationMessage" , generatedLocationMessage(user.username,url));
        callback();
    });

    socket.on("disconnect" , ()=>{
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit("message" , generatedMessage("admin",`${user.username} has left`));
            io.to(user.room).emit("roomData" ,{
                room : user.room , 
                users : getUsersInRoom(user.room)
            });
        }
    });
});


app.use(express.static(publicDirectoryPath));

server.listen(port , ()=>{
    console.log("listening on " + port);
});
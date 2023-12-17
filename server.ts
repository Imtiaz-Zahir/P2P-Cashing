import express, { Request, Response } from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import fs from "fs";

const app = express();
const server = createServer(app);
const port = 3000;

const io = new Server(server, { cors: { origin: "*" } });

let script: string;
const connections: { [key: string]: RTCSessionDescriptionInit } = {};

const simpleText = "Hello To Me!";

fs.readFile("script.js", (err, data) => {
  if (err) throw err;
  script = data.toString();
});

app.get("/", (_: Request, res: Response) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/script.js", (_: Request, res: Response) => {
  res.sendFile(__dirname + "/script.js");
});

io.on("connection", (socket) => {
  console.log("user connected");

  // socket.emit("js", script);

  const socketIds = Object.keys(connections);
  if (socketIds.length > 0) {
    socket.emit("data", {
      getFromOther: true,
      data: {offer:connections[socketIds[0]],socketId:socketIds[0]},
    });
    console.log(socketIds);
  } else {
    socket.emit("data", { getFromOther: false, data: simpleText });
  }

  socket.on("offer", (offer: RTCSessionDescriptionInit) => {
    connections[socket.id] = offer;
  });

  socket.on("answer", ({answer,socketId}: {answer:RTCSessionDescriptionInit,socketId:string}) => {
    socket.to(socketId).emit("answer", answer);
    delete connections[socketId];
  });

  socket.on("disconnect", function () {
    console.log("user disconnected");
    if (connections[socket.id]) {
      delete connections[socket.id];
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

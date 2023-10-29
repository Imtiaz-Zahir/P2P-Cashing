const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const port = process.env.PORT || 3000;
const e = require("express");
const fs = require("fs");

// app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
io.on("connection", (socket) => {
  console.log("user connected");

  fs.readFile("so.js", (err, data) => {
    if (err) throw err;
    socket.emit("js", data.toString());
    console.log("done");
  });

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});
server.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

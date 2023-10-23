const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server,{cors: {origin: "*"}});
const port = process.env.PORT || 3000;

const 


app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
io.on('connection', (socket) => {
  console.log('user connected');
  socket.emit()

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
})
server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
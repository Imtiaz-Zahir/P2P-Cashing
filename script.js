const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
const peerConnection = new RTCPeerConnection(configuration);

const socket = io("http://localhost:3000");
socket.on("js", (data) => {
  const script = document.createElement("script");
  script.text = data;
  document.body.appendChild(script);
});

socket.on("data", ({ getFromOther, data }) => {
  if (getFromOther) {
    connectToDataChannel(data.offer, data.socketId);
  } else {
    useReceivedData(data);
    createOfferAndDataChannel(data);
  }
});

function createOfferAndDataChannel(data) {
  peerConnection.onicecandidate = async () => {
    console.log("NEW ice candidnat!!");
    await socket.emit("offer", peerConnection.localDescription);
  };

  const dataChannel = peerConnection.createDataChannel("sendChannel");

  dataChannel.onopen = () => {
    console.log("open!!!!");
    dataChannel.send(data);
  };

  dataChannel.onclose = () => console.log("closed!!!!!!");

  dataChannel.onmessage = (e) => {
    console.log("messsage received!!!" + e.data);
  };

  peerConnection
    .createOffer()
    .then((offer) => peerConnection.setLocalDescription(offer));

  socket.on("answer", (answer) =>
    peerConnection.setRemoteDescription(answer).then((a) => console.log("done"))
  );
}

function connectToDataChannel(offer, socketId) {
  peerConnection.setRemoteDescription(offer).then((a) => console.log("done"));

  peerConnection.onicecandidate = async (e) => {
    console.log(" NEW ice candidnat!!");
    await socket.emit("answer", {
      answer: peerConnection.localDescription,
      socketId,
    });
  };

  peerConnection.ondatachannel = ({ channel }) => {
    channel.onmessage = (e) => {
      console.log("messsage received!!!" + e.data);
      useReceivedData(e.data);
    };

    channel.onopen = (e) => console.log("open!!!!");
    channel.onclose = (e) => console.log("closed!!!!!!");

    peerConnection.channel = channel;
  };

  //create answer
  peerConnection
    .createAnswer()
    .then((answer) => peerConnection.setLocalDescription(answer));
}

function useReceivedData(data) {
  const h1 = document.createElement("h1");
  h1.innerText = data;
  document.body.appendChild(h1);
}

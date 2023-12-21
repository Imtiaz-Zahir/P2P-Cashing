const socket = io("/");
const files = new Object();

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
const peerConnection = new RTCPeerConnection(configuration);
const dataChannel = peerConnection.createDataChannel("channel");

dataChannel.onmessage = (e) => console.log("messsage received!!!" + e.data);

dataChannel.onopen = () => {
  if (files.style && files.js) {
    dataChannel.send("hello");
  }
};

peerConnection.onicecandidate = async function () {
  if (peerConnection.localDescription.type === "offer") {
    console.log(" NEW ice candidnat!! offer");
    await socket.emit("offer", peerConnection.localDescription);
  } else if (peerConnection.localDescription.type === "answer") {
    console.log(" NEW ice candidnat!! answer");
    await socket.emit("answer", peerConnection.localDescription);
  } else {
    console.log(" NEW ice candidnat!!", peerConnection.localDescription);
  }
};

socket.on("css", appendStyle);

socket.on("js", appendJS);

socket.on("answer", (answer) => peerConnection.setRemoteDescription(answer));

socket.on("getFromOther", (offer) => {
  peerConnection.setRemoteDescription(offer);
  peerConnection
    .createAnswer()
    .then((answer) => peerConnection.setLocalDescription(answer));
});


function appendStyle(data) {
  const style = document.createElement("style");
  style.innerText = data;
  document.head.appendChild(style);
  files.style = data;
  sendOffer();
}

function appendJS(data) {
  const script = document.createElement("script");
  script.innerText = data;
  document.body.appendChild(script);
  files.js = data;
  sendOffer();
}

function sendOffer() {
  if (files.style && files.js) {
    peerConnection
      .createOffer()
      .then((offer) => peerConnection.setLocalDescription(offer));
  }
}

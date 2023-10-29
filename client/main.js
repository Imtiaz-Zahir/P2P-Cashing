// import { io } from "socket.io-client";

// const socket = io("http://localhost:3000");

// socket.on("js", (data) => {
//   const script = document.createElement("script");
//   script.text = data;
//   document.body.appendChild(script);
// });

const configuration = {
  iceServers: [
    {
      urls: "stun:stun1.l.google.com:19302",
    },
  ],
};

const RTC = new RTCPeerConnection(configuration);

const channel = RTC.createDataChannel("channel");

// RTC.onicecandidate = (e) => {
// console.log(JSON.stringify(RTC.localDescription));
// if (e.candidate) {
//   socket.emit('candidate', e.candidate);
// }
// }

RTC.createOffer().then((offer) => {
  RTC.setLocalDescription(offer);
  console.log(offer);
  // socket.emit('offer', offer);
});

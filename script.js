const socket = io("/");
const files = new Object();

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
const peerConnection = new RTCPeerConnection(configuration);
const dataChannel = peerConnection.createDataChannel("channel");

peerConnection.ondatachannel = ({ channel }) => {
  const jsChunks = [];
  channel.onmessage = ({ data }) => {
    const receivedData = JSON.parse(data);
    if (!files.style && receivedData.type === "css") {
      appendStyle(receivedData.data);
    } else if (!files.js && receivedData.type === "js") {
      jsChunks.push(receivedData);
      // appendJS(receivedData.data);
      if (jsChunks.length === receivedData.totalChunks) {
        const sortChunks = jsChunks.sort(
          (a, b) => a.chunkNumber < b.chunkNumber
        );
        const js = sortChunks.reduce((acc, cur) => acc + cur.data, "");
        appendJS(js);
      }
    }
  };
};

dataChannel.onopen = () => {
  console.log("open");
  if (files.style && files.js) {
    dataChannel.send(JSON.stringify({ type: "css", data: files.style }));
    const chunks = chunkObject(files.js);

    for (let index = 0; index < chunks.length; index++) {
      dataChannel.send(JSON.stringify({
        type: "js",
        totalChunks: chunks.length,
        chunkNumber: index,
        data: chunks[index],
      }));
    }
    // dataChannel.send(JSON.stringify({ type: "js", data: files.js }));
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

// if (!files.style && !files.js) {
//   console.log("not found");
//   socket.emit("fileNotFound", {});
// }

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

function objectToBuffer(string) {
  // const jsonString = JSON.stringify(object);
  const textEncoder = new TextEncoder();
  const binaryData = textEncoder.encode(string);
  return binaryData;
}

function chunkObject(string) {
  const CHUNK_SIZE = 16 * 1024; // 16 KB chunks
  const chunks = [];

  for (let i = 0; i < string.length; i += CHUNK_SIZE) {
    const chunk = string.slice(i, i + CHUNK_SIZE);
    chunks.push(chunk);
  }
  return chunks;
}

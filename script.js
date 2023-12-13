(async () => {
    const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    const peerConnection = new RTCPeerConnection(configuration);
    const signalingChannel = peerConnection.createDataChannel('chat');
    signalingChannel.onmessage = (message) => console.log(message.data);
    signalingChannel.onopen = () => console.log('Connection opened');
    // signalingChannel.addEventListener('message', async message => {
    //     if (message.answer) {
    //         const remoteDesc = new RTCSessionDescription(message.answer);
    //         await peerConnection.setRemoteDescription(remoteDesc);
    //     }
    // });
    const offer = await peerConnection.createOffer();
    console.log(offer);
    await socket.emit("offer", offer)
    await peerConnection.setLocalDescription(offer);
    // signalingChannel.send({'offer': offer});
})();

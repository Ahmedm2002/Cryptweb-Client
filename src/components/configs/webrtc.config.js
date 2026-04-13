const rtcConnection = new RTCPeerConnection({
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
});

rtcConnection.onicecandidate = (event) => {
  if (event.candidate) {
    console.log("New ICE candidate generated:", event.candidate);
    if (rtcConnection.onCandidateGenerated) {
      rtcConnection.onCandidateGenerated(event.candidate);
    }
  }
};

rtcConnection.onconnectionstatechange = () => {
  console.log("RTC Connection State:", rtcConnection.connectionState);
};

rtcConnection.oniceconnectionstatechange = () => {
  console.log("ICE Connection State:", rtcConnection.iceConnectionState);
};

rtcConnection.ondatachannel = (event) => {
  console.log("Incoming Data Channel received");
  const receiveChannel = event.channel;
  setupDataChannel(receiveChannel);
};

function setupDataChannel(channel) {
  channel.onopen = () => {
    console.log("Data channel opened");
  };

  channel.onmessage = (event) => {
    console.log("Data channel Event:", event);
  };

  channel.onclose = () => {
    console.log("Data channel closed");
  };

  channel.onerror = (error) => {
    console.log("Data channel error:", error);
  };
}

function createDataChannel() {
  console.log("Creating Data Channel: channel:file-transfer");
  const dataChannel = rtcConnection.createDataChannel("channel:file-transfer", {
    ordered: true,
  });

  setupDataChannel(dataChannel);
  return dataChannel;
}
async function setIceCandidates(iceCandidates) {
  for (const candidate of iceCandidates) {
    await rtcConnection.addIceCandidate(candidate);
  }
}

async function createOffer() {
  const offer = await rtcConnection.createOffer();
  await rtcConnection.setLocalDescription(offer);
  return offer;
}

async function createAnswer() {
  const answer = await rtcConnection.createAnswer();
  await rtcConnection.setLocalDescription(answer);
  return answer;
}

async function setRemoteDescription(description) {
  await rtcConnection.setRemoteDescription(description);
}

function closeConnection() {
  rtcConnection.close();
}

export {
  rtcConnection,
  setIceCandidates,
  createOffer,
  createAnswer,
  setRemoteDescription,
  closeConnection,
  createDataChannel,
};

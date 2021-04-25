// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Experiments       - github.com/muaz-khan/WebRTC-Experiment

// This library is known as multi-user connectivity wrapper!
// It handles connectivity tasks to make sure two or more users can interconnect!
import { RTCPeerConnection } from "./RTCPeerConnection-v1.5.js";
export const conference = function (config) {
  var self = {
    userToken: uniqueToken(),
    userName: "HI",
    ishost: false,
    joinees: [],
  };

  var share = false;
  var channels = "--",
    isbroadcaster;
  var isGetNewRoom = true;
  var sockets = [];
  var defaultSocket = {};
  var peers = [];
  function openDefaultSocket(callback) {
    defaultSocket = config.openSocket({
      onmessage: onDefaultSocketResponse,
      userName: self.userName,
      ishost: self.ishost,
      callback: function (socket) {
        defaultSocket = socket;
        // console.log("Set default socket as = " + defaultSocket);
        callback();
      },
    });
  }

  function onDefaultSocketResponse(response) {
    // console.log(response);
    if (response.userToken == self.userToken) {
      // console.log("a");
      return;
    }
    if (response.sharedScreen) {
      config.onScreenShare(
        response.userToken,
        response.peerlist,
        response.tracks
      );
    }
    if (isGetNewRoom && response.roomName && response.broadcaster) {
      // console.log(
      //   "Room found! roomToken = " +
      //     response.roomToken +
      //     " and broadcaster=" +
      //     response.broadcaster
      // );
      config.onRoomFound(response);
    }
    if (
      response.newParticipant &&
      self.joinedARoom &&
      self.broadcasterid == response.userToken
    )
      onNewParticipant(
        response.newParticipant,
        response.userName,
        response.ishost
      );
    // ||
    //response.joinUser == self.broadcasterid;
    if (
      response.userToken &&
      response.joinUser == self.userToken &&
      response.participant &&
      channels.indexOf(response.userToken) == -1
    ) {
      channels += response.userToken + "--";
      openSubSocket({
        isofferer: true,
        ishost: response.ishost,
        joinees: self.joinees,
        userName: response.userName,
        channel: response.channel || response.userToken,
      });
    }

    // to make sure room is unlisted if owner leaves
    if (response.left && config.onRoomClosed) {
      config.onRoomClosed(response);
    }

    if (response.togglemute) {
      config.togglemute();
    }
    if (response.toggleunmute) {
      config.toggleunmute();
    }
    if (response.sms) {
      if (response.to == self.userName) {
        //alert(response.message);
        config.getMessage(response.message, response.from);
      }
    }
  }

  function openSubSocket(_config) {
    console.log("Opening sub socket");
    if (!_config.channel) return;
    var socketConfig = {
      channel: _config.channel,
      userName: _config.userName,
      ishost: _config.ishost,
      onmessage: socketResponse,
      onopen: function (socket) {
        if (isofferer && !peer) initPeer();
        sockets[sockets.length] = socket;
      },
    };
    if (_config.userName != null && !self.joinees.includes(_config.userName))
      self.joinees.push(_config.userName);
    socketConfig.callback = function (_socket) {
      socket = _socket;
      this.onopen(socket);

      if (_config.callback) {
        _config.callback();
      }
    };

    var socket = config.openSocket(socketConfig),
      isofferer = _config.isofferer,
      gotstream,
      video = document.createElement("video"),
      inner = {},
      userName = _config.userName,
      ishost = _config.ishost,
      //share=document.createElement('video'),
      peer;

    var peerConfig = {
      attachStream: config.attachStream,
      share: share,

      initialtoken: self.userToken,
      onICE: function (candidate) {
        console.log("Ice happened!" + JSON.stringify(candidate));
        socket.send({
          userToken: self.userToken,
          userName: _config.userName,
          ishost: _config.ishost,
          candidate: {
            sdpMLineIndex: candidate.sdpMLineIndex,
            candidate: JSON.stringify(candidate.candidate),
          },
        });
      },
      onRemoteStream: function (stream) {
        console.log("Remote stream...");

        if (!stream) return;

        try {
          video.setAttributeNode(document.createAttribute("autoplay"));
          video.setAttributeNode(document.createAttribute("playsinline"));
          video.setAttributeNode(document.createAttribute("controls"));
        } catch (e) {
          video.setAttribute("autoplay", true);
          video.setAttribute("playsinline", true);
          video.setAttribute("controls", true);
        }
        stream.streamid = _config.userName;
        video.srcObject = stream;

        _config.stream = stream;
        onRemoteStreamStartsFlowing();
      },
      onRemoteStreamEnded: function (stream) {
        if (config.onRemoteStreamEnded)
          config.onRemoteStreamEnded(stream, video);
      },
    };

    function initPeer(offerSDP) {
      if (!offerSDP) {
        peerConfig.onOfferSDP = sendsdp;
      } else {
        peerConfig.offerSDP = offerSDP;
        peerConfig.onAnswerSDP = sendsdp;
      }

      peer = new RTCPeerConnection(peerConfig);
      console.log("PPPPPPPPPPPPEEEEEEEEERRRRRRRRR!");
      peers.push(peer);
    }

    function afterRemoteStreamStartedFlowing() {
      gotstream = true;

      if (config.onRemoteStream)
        config.onRemoteStream({
          video: video,
          ishost: _config.ishost,
          userName: _config.userName,
          stream: _config.stream,
          joinees: self.joinees,
        });

      if (isbroadcaster && channels.split("--").length > 1) {
        /* broadcasting newly connected participant for video-conferencing! */
        defaultSocket.send({
          newParticipant: socket.channel,
          userToken: self.userToken,
          userName: _config.userName,
          ishost: _config.ishost,
          joinees: self.joinees,
        });
      }
    }

    function onRemoteStreamStartsFlowing() {
      if (
        navigator.userAgent.match(
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i
        )
      ) {
        // if mobile device
        return afterRemoteStreamStartedFlowing();
      }

      if (
        !(
          video.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA ||
          video.paused ||
          video.currentTime <= 0
        )
      ) {
        afterRemoteStreamStartedFlowing();
      } else setTimeout(onRemoteStreamStartsFlowing, 50);
    }

    function sendsdp(sdp) {
      socket.send({
        userToken: self.userToken,
        userName: self.userName,
        ishost: self.ishost,
        sdp: JSON.stringify(sdp),
      });
    }

    function socketResponse(response) {
      console.log("Socket response is: " + JSON.stringify(response));
      if (response.userToken == self.userToken) {
        console.log("Returning!");
        return;
      }
      if (response.sdp) {
        inner.sdp = JSON.parse(response.sdp);
        selfInvoker();
      }

      if (response.candidate && !gotstream) {
        if (!peer) console.error("missed an ice", response.candidate);
        else
          peer.addICE({
            sdpMLineIndex: response.candidate.sdpMLineIndex,
            candidate: JSON.parse(response.candidate.candidate),
          });
      }

      if (response.left) {
        if (peer && peer.peer) {
          peer.peer.close();
          peer.peer = null;
        }
      }
    }

    var invokedOnce = false;

    function selfInvoker() {
      if (invokedOnce) return;

      invokedOnce = true;

      if (isofferer) peer.addAnswerSDP(inner.sdp);
      else initPeer(inner.sdp);
    }
  }

  function leave() {
    var length = sockets.length;
    for (var i = 0; i < length; i++) {
      var socket = sockets[i];
      if (socket) {
        socket.send({
          left: true,
          userToken: self.userToken,
        });
        delete sockets[i];
      }
    }

    // if owner leaves; try to remove his room from all other users side
    if (isbroadcaster) {
      defaultSocket.send({
        left: true,
        userToken: self.userToken,
        userName: self.userName,
        ishost: self.ishost,
        roomToken: self.roomToken,
      });
    }

    if (config.attachStream) {
      if ("stop" in config.attachStream) {
        config.attachStream.stop();
      } else {
        config.attachStream.getTracks().forEach(function (track) {
          track.stop();
        });
      }
    }
  }

  window.addEventListener(
    "beforeunload",
    function () {
      leave();
    },
    false
  );

  window.addEventListener(
    "keyup",
    function (e) {
      if (e.keyCode == 116) leave();
    },
    false
  );

  function startBroadcasting() {
    // console.log(
    //   self.roomToken +
    //     "-" +
    //     self.roomName +
    //     "-" +
    //     self.userToken +
    //     "-" +
    //     self.userName +
    //     "-" +
    //     self.ishost +
    //     "-" +
    //     self.joinees
    // );
    defaultSocket &&
      defaultSocket.send({
        roomToken: self.roomToken,
        roomName: self.roomName,
        broadcaster: self.userToken,
        userName: self.userName,
        ishost: self.ishost,
        joinees: self.joinees,
      });
    setTimeout(startBroadcasting, 3000);
  }

  function onNewParticipant(channel, un, ih) {
    console.log("on New Participant!");
    if (
      !channel ||
      channels.indexOf(channel) != -1 ||
      channel == self.userToken
    )
      return;
    channels += channel + "--";

    var new_channel = uniqueToken();
    openSubSocket({
      channel: new_channel,
      userName: un,
      ishost: ih,
      joinees: self.joinees,
    });

    defaultSocket.send({
      participant: true,
      userToken: self.userToken,
      userName: self.userName,
      ishost: self.ishost,
      joinees: self.joinees,
      joinUser: channel,
      channel: new_channel,
    });
  }

  function uniqueToken() {
    var s4 = function () {
      return Math.floor(Math.random() * 0x10000).toString(16);
    };
    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  }

  openDefaultSocket(config.onReady || function () {});

  return {
    muteall: function () {
      defaultSocket.send({
        togglemute: true,
      });
    },
    unmuteall: function () {
      defaultSocket.send({
        toggleunmute: true,
      });
    },
    sendMessage: function (_config) {
      var from = _config.from;
      var to = _config.to;
      var message = _config.message;
      defaultSocket.send({
        from: from,
        to: to,
        message: message,
        sms: true,
      });
    },
    createRoom: function (_config) {
      self.roomName = _config.roomName || "Anonymous";
      self.roomToken = _config.channel;
      self.userName = _config.userName;
      self.ishost = true;
      self.joinees.push(_config.userName);
      self.userToken = _config.userToken;
      isbroadcaster = true;
      isGetNewRoom = false;
      startBroadcasting();
      console.log("Started broadcasting");
    },
    joinRoom: function (_config) {
      self.roomToken = _config.roomToken;
      isGetNewRoom = false;
      self.userName = _config.userName;
      self.joinedARoom = true;
      self.broadcasterid = _config.joinUser;
      self.ishost = false;
      self.joinees = _config.joinees;
      self.userToken = _config.userToken;
      openSubSocket({
        channel: self.userToken,
        joinees: self.joinees,
        callback: function () {
          defaultSocket.send({
            participant: true,
            userToken: self.userToken,
            userName: self.userName,
            ishost: false,
            joinUser: _config.joinUser,
          });
        },
      });
    },
    leaveRoom: leave,
    /*addStream: function(stream){
			
			for(var i=0;i<peers.length;i++)
			{
				peers[i].share=true;
				peers[i].addTrack(stream);
			}
			//var stream=peers[0].getLocalStreams()[1];
				
			var video = document.createElement('video');
			try {
                    video.setAttributeNode(document.createAttribute('autoplay'));
                    video.setAttributeNode(document.createAttribute('playsinline'));
                    video.setAttributeNode(document.createAttribute('controls'));
                } catch (e) {
                    video.setAttribute('autoplay', true);
                    video.setAttribute('playsinline', true);
                    video.setAttribute('controls', true);
                }
				
                video.srcObject = stream;
			config.onRemoteStream({
                    video: video,
                    stream: stream
                });
				
				defaultSocket.send({
					channel: defaultSocket.channel,
                    sharedScreen: true,
                    userToken: self.userToken,
					peerlist: peers,
					tracks: tracks
                });
			
		},*/
    joinees: self.joinees,
    peers: peers,
  };
};

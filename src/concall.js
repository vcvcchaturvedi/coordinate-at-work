import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { conference } from "./conference.js";
import "./getMediaElement-v1.2.js";
import { getUserMedia } from "./RTCPeerConnection-v1.5.js";
const io = require("socket.io-client");
<script src="http://webrtc.github.io/adapter/adapter-latest.js"></script>;

var videolist = null;
var mediaRecorder;
var hostvideo = null;
var hoststream = null;

var ishost = false;
var clientstream = null;
var mymediaelement = null;
var hostname = null;
var sharevideo = null;
var audiostreams = [];
var shared = false;
var clientvideo = null;
var audiostreamscount = 0;
var myusername = null;
export const MainPanel = function () {
  useEffect(() => {
    initiateUniqueTokenLink();
    roomsList = document.getElementById("rooms-list");
  }, []);
  return (
    <section className="experiment">
      <section>
        <span>
          Private ??{" "}
          <a
            href="/video-conferencing/"
            target="_blank"
            title="Open this link in new tab. Then your conference room will be private!"
          >
            <code>
              <strong id="unique-token">#123456789</strong>
            </code>
          </a>
        </span>
        <input
          type="text"
          id="employeeuid"
          placeholder="Your Unique Employee ID"
          // style="width:100"
        ></input>
        <input
          type="text"
          id="conference-name"
          placeholder="Conference Name"
          // style="width: 50%;"
        ></input>
        <button
          id="setup-new-room"
          className="setup"
          onClick={setupNewRoomButtonClickHandler}
        >
          Setup New Conference
        </button>
        <br />
        <button id="record">Start Recording</button>
        <button id="download" disabled>
          Download
        </button>
        <button id="share" onClick={shareClick}>
          Share Screen
        </button>
      </section>

      <table id="rooms-list"></table>

      <canvas
        id="canvasMain"
        width="800"
        height="600"
        style={({ display: "none" }, { visibility: "hidden" })}
      ></canvas>
      <br />
      <button id="muteall" onClick={muteall} style={{ visibility: "hidden" }}>
        Mute all
      </button>
      <button
        id="unmuteall"
        onClick={unmuteall}
        style={{ visibility: "hidden" }}
      >
        UnMute all
      </button>
      <br />
      <div id="videos-container">
        <div id="invideo" style={{ overflow: "auto" }}></div>
      </div>
      <br />
      <div id="chatbox" style={{ display: "block" }} width="400px"></div>
      <canvas
        id="canvasHost"
        width="300"
        height="180"
        style={({ display: "none" }, { visibility: "hidden" })}
      ></canvas>
      <br />
    </section>
  );
};
if (!window.location.hash.replace("#", "").length) {
  window.location.href =
    window.location.href.split("#")[0] +
    "#" +
    (Math.random() * 100).toString().replace(".", "");
}

var ENDPOINT = "https://infinite-sands-36467.herokuapp.com/"; //"http://127.0.0.1:4001/";
let channel = window.location.href.replace(/\/|:|#|%|\.|\[|\]/g, "");
let sender = Math.round(Math.random() * 999999999) + 999999999;

var can; //= document.getElementById("canvasMain");
var mainstream; // = can.captureStream();
var config = {
  // via: https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs
  openSocket: function (config) {
    // const socket = socketIOClient(ENDPOINT);
    // let channel = (Math.random() * 100).toString().replace(".", "");

    config.channel = channel; //window.location.href.replace(/\/|:|#|%|\.|\[|\]/g, "");
    io.connect(ENDPOINT).emit("new-channel", {
      channel: config.channel,
      sender: sender,
    });
    // io.connect(ENDPOINT).emit("new-channel", {
    //   channel: config.channel,
    //   sender: sender,
    // });
    const sleep = (t) => new Promise((s) => setTimeout(s, t));
    async function demo() {
      let i = 3;
      while (i--) {
        await sleep(1000);
        console.log(i);
      }
    }
    demo().then(() => {
      let mainsocket = io.connect(ENDPOINT + config.channel);
      console.log(config.channel);
      mainsocket.channel = config.channel;
      mainsocket.on("connectup", function () {
        console.log("connect up! " + config.callback);
        config.callback(mainsocket);
      });
      mainsocket.send = function (message) {
        mainsocket.emit("message", {
          sender: sender,
          data: message,
        });
      };

      mainsocket.on("message", config.onmessage);
    });
  },
  togglemute: function () {
    try {
      mymediaelement.getAudioTracks().forEach(function (track) {
        track.enabled = false;
      });
    } catch (err) {}
  },
  toggleunmute: function () {
    try {
      mymediaelement.getAudioTracks().forEach(function (track) {
        track.enabled = true;
      });
    } catch (err) {}
  },

  onScreenShare: function (userName, peerlist, tracks) {
    let peers = peerlist;
    alert("JI" + peers.length);
    for (var i = 0; i < peers.length; i++) {
      if (peers[i].initialtrack == userName) {
        alert(tracks[0]);
        //var streams=peers[i].peer.getLocalStreams();
        //alert("streams="+streams);
        //alert('hi not null');
        //alert(peers[i].share);
        var video = document.createElement("video");
        video.muted = true;
        video.volume = 0;

        try {
          video.setAttributeNode(document.createAttribute("autoplay"));
          video.setAttributeNode(document.createAttribute("playsinline"));
          video.setAttributeNode(document.createAttribute("controls"));
        } catch (e) {
          video.setAttribute("autoplay", true);
          video.setAttribute("playsinline", true);
          video.setAttribute("controls", true);
        }
        try {
          //video.srcObject = tracks[0];
          alert("done");
        } catch (e) {
          alert(e);
        }
        var mediaElement = window.getMediaElement(video, {
          width: videosContainer.clientWidth / 2 - 50,
          height: videosContainer.clientHeight,
          buttons: ["mute-audio", "mute-video", "full-screen", "volume-slider"],
        });
        mediaElement.id = "userName";
        videosContainer.appendChild(mediaElement);
        videolist.push(video);
        loopMain();
      } else {
        alert("Dont know" + peers[i].initialtrack);
      }
    }
  },
  onRemoteStream: function (media) {
    // alert(media.userName);
    var title = "";
    var foundhost = false;
    //if(ishost==true)
    //if(media.ishost==true)
    title = media.userName;
    //else
    //title=media.stream.streamid;
    var width1 = 150;
    var height1 = 120;
    if (title == null) {
      foundhost = true;
      title = hostname + " (host)";
      width1 = videosContainer.width; //.clientWidth;
      height1 = 400;
    }
    //else
    //alert(media.joinees.length+" " +media.joinees[media.joinees.length-1]);
    //alert(media.joinees[media.joinees.length-1]);
    //title=media.joinees[media.joinees.length-1];
    var mediaElement = window.getMediaElement(media.video, {
      title: title,
      width: width1,
      height: height1,

      buttons: ["mute-audio", "mute-video", "full-screen", "volume-slider"],
    });
    mediaElement.id = media.stream.streamid;
    if (foundhost) {
      videosContainer.appendChild(mediaElement);
      //quit the conference here for all if host quits
      //media.video.getVideoTracks()[0].onended=function(){alert('hello');videosContainer.removeChild(mediaElement);};
    } else {
      var videoc = document.getElementById("invideo");
      videoc.appendChild(mediaElement);
      media.stream.getVideoTracks()[0].onended = function (event) {
        alert("hi");
        videoc.removeChild(mediaElement);
        for (let k = 0; k < videolist.length; k++)
          if (videolist[k] == media.video) videolist.splice(k, 1);
        reset = true;
        let smsExited = document.getElementById("div" + mediaElement.id);
        smsExited.parentNode.remove();
        loopMain();
      };
    }
    videolist.push(media.video);

    //if(clientvideo!=null)
    //{
    //if(hostvideo!=null)
    //{
    //videolist.push(clientvideo);
    //}

    var tracks = media.stream.getAudioTracks();

    //for(var h=0;h<tracks.length;h++)
    //{
    //var audioTrack = tracks[h];
    //audiostreams.push(audioTrack);
    //}
    audiostreams.push(...tracks);
    loopMain();
    //}

    var chatbox = document.getElementById("chatbox");
    //var show=document.createElement('a');
    //var select=document.createElement('select');
    //var option=document.createElement('option');

    //var hide=document.createElement('a');
    var title2 = "";
    if (foundhost) title2 = hostname;
    else title2 = title;

    //select.setAttribute('style','width: 100px;height: auto');

    /*hide.text=title2;
						show.text=title2;
						show.setAttribute('class','show'+title2);
						show.setAttribute('id','show'+title2);
						hide.setAttribute('class','hide'+title2);
						hide.setAttribute('id','hide'+title2);
						show.setAttribute('href','#hide'+title2);
						hide.setAttribute('href','#show'+title2);*/
    var div = document.createElement("div");
    div.setAttribute("id", "div" + title2);
    div.setAttribute("class", "details" + title2);
    /*var str1='.details'+title2+',\n'+
'.show'+title2+',\n'+
'.hide'+title2+':target {\n'+
'  display: none;\n'+
'}\n'+
'.hide'+title2+':target + .show'+title2+',\n'+
'.hide'+title2+':target ~ .details'+title2+' {\n'+
'  display: block;\n'+
'}';
		
						  //chatbox.innerHTML+='<style>.details'+title2+',.show'+title2+',.hide'+title2+':target {  display: none;}.hide'+title2+':target + .show'+title2+',.hide'+title2+':target ~ .details'+title2+' {display: block;}</style>';
						chatbox.innerHTML+='<style>'+str1+'</style>';
						*/
    var senttext = document.createElement("div");
    senttext.setAttribute("id", "smsst:" + title2);
    senttext.setAttribute("width", "150px");
    var tb = document.createElement("textarea");
    tb.setAttribute("id", "sms:" + title2);
    tb.setAttribute("width", "150px");
    //tb.value=myusername+' : ';
    var button = document.createElement("button");
    button.onclick = function () {
      var text = tb.value; //.split(myusername+' : ');
      var message = text; //[text.length-1];

      conferenceUI.sendMessage({
        from: myusername,
        to: title2,
        message: message,
      });
      tb.value = "";
    };
    //show.appendChild(div);
    //chatbox.appendChild(show);
    //chatbox.appendChild(hide);
    div.appendChild(senttext);
    div.appendChild(tb);
    div.appendChild(button);
    var details = document.createElement("details");
    details.setAttribute("id", "details:" + title2);
    details.setAttribute("width", "200px");
    var summary = document.createElement("summary");
    summary.setAttribute("width", "200px");
    summary.innerHTML = title2;
    details.appendChild(summary);
    details.appendChild(div);
    //option.innerHTML=title2;
    chatbox.appendChild(details);
    //option.appendChild(div);
    //select.options.add(option);
    //chatbox.appendChild(select,1);
  },
  getMessage: function (message, from) {
    var details = document.getElementById("details:" + from);
    details.setAttribute("open", "open");
    var st = document.getElementById("smsst:" + from);
    st.innerHTML = st.innerHTML + "<br/>" + message;
  },
  onRemoteStreamEnded: function (stream, video) {
    if (
      video.parentNode &&
      video.parentNode.parentNode &&
      video.parentNode.parentNode.parentNode
    ) {
      video.parentNode.parentNode.parentNode.removeChild(
        video.parentNode.parentNode
      );
    }
  },
  onRoomFound: function (room) {
    console.log("Room found!");
    videosContainer =
      document.getElementById("videos-container") || document.body;
    can = document.getElementById("canvasMain");
    mainstream = can.captureStream();

    var alreadyExist = document.querySelector(
      'button[data-broadcaster="' + room.broadcaster + '"]'
    );
    if (alreadyExist) return;
    var usern = document.getElementById("employeeuid").value;

    if (typeof roomsList === "undefined") roomsList = document.body;

    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td><strong>" +
      room.roomName +
      "</strong> shared a conferencing room with you!</td>" +
      '<td><button className="join" id="join">Join</button></td>';
    roomsList.appendChild(tr);
    hostname = room.userName;
    var joinRoomButton = document.getElementById("join");
    joinRoomButton.setAttribute("data-broadcaster", room.broadcaster);
    joinRoomButton.setAttribute("data-roomToken", room.roomToken);
    joinRoomButton.onclick = function () {
      var usern = document.getElementById("employeeuid").value;
      if (room.joinees.includes(usern)) {
        alert("User name already exists, please choose another user name!");
        return;
      }
      myusername = usern;
      this.disabled = true;
      var shareButton = document.getElementById("share");
      shareButton.disabled = true;
      var broadcaster = this.getAttribute("data-broadcaster");
      var roomToken = this.getAttribute("data-roomToken");
      captureUserMedia(
        function () {
          conferenceUI.joinRoom({
            roomToken: roomToken,
            userName: usern,
            userToken: sender,
            joinUser: broadcaster,
            joinees: room.joinees,
          });
        },
        function () {
          joinRoomButton.disabled = false;
        }
      );
    };
  },
  onRoomClosed: function (room) {
    var joinButton = document.querySelector(
      'button[data-roomToken="' + room.roomToken + '"]'
    );
    if (joinButton) {
      // joinButton.parentNode === <li>
      // joinButton.parentNode.parentNode === <td>
      // joinButton.parentNode.parentNode.parentNode === <tr>
      // joinButton.parentNode.parentNode.parentNode.parentNode === <table>
      joinButton.parentNode.parentNode.parentNode.parentNode.removeChild(
        joinButton.parentNode.parentNode.parentNode
      );
    }
  },
  onReady: function () {
    console.log("now you can open or join rooms");
  },
};
var conferenceUI = conference(config);
function setupNewRoomButtonClickHandler() {
  can = document.getElementById("canvasMain");
  mainstream = can.captureStream();
  videolist = [];
  ishost = true;
  videosContainer =
    document.getElementById("videos-container") || document.body;
  btnSetupNewRoom = document.getElementById("setup-new-room");

  btnSetupNewRoom.disabled = true;
  document.getElementById("conference-name").disabled = true;
  myusername = document.getElementById("employeeuid").value;
  captureUserMedia(
    function () {
      conferenceUI.createRoom({
        userName: document.getElementById("employeeuid").value,
        ishost: true,
        uniqueToken: config.channel,
        roomName:
          (document.getElementById("conference-name") || {}).value ||
          "Anonymous",
        userToken: sender,
        channel: config.channel,
      });

      if (clientvideo != null) {
        hostvideo = clientvideo;
        hoststream = clientstream;
        videolist.push(clientvideo);
        loopMain();
        var canh = document.getElementById("canvasHost");
        hostvideo.addEventListener("playing", binderfuncshare, 0);
        var hstream = canh.captureStream();
        var audioTrack = hoststream.getAudioTracks()[0];
        hstream.addTrack(audioTrack);
        hstream.streamid = document.getElementById("employeeuid").value;
        config.attachStream = hstream;
      }
    },
    function () {
      btnSetupNewRoom.disabled = document.getElementById(
        "conference-name"
      ).disabled = false;
    }
  );
  var mutebutton = document.getElementById("muteall");
  mutebutton.style.visibility = "visible";
  var unmutebutton = document.getElementById("unmuteall");
  unmutebutton.style.visibility = "visible";
  initiateUniqueTokenLink();
}

function captureUserMedia(callback, failure_callback) {
  var video = document.createElement("video");
  video.muted = true;
  video.volume = 0;

  try {
    video.setAttributeNode(document.createAttribute("autoplay"));
    video.setAttributeNode(document.createAttribute("playsinline"));
    video.setAttributeNode(document.createAttribute("controls"));
  } catch (e) {
    video.setAttribute("autoplay", true);
    video.setAttribute("playsinline", true);
    video.setAttribute("controls", true);
  }
  var title = "";

  title = document.getElementById("employeeuid").value;
  //alert(ishost);
  getUserMedia({
    video: video,

    onsuccess: function (stream) {
      if (!ishost) stream.streamid = title;
      if (!ishost) config.attachStream = stream;
      //
      var width1 = 150;
      if (ishost) width1 = videosContainer.clientWidth / 2 - 50;
      var mediaElement = window.getMediaElement(video, {
        title: title,
        width: width1,
        buttons: ["mute-video", "mute-audio", "volume-slider", "stop"], //['mute-audio', 'mute-video', 'full-screen', 'volume-slider']
        //toggle: ['mute-audio', 'mute-video', 'record-audio', 'record-video'],
        onMuted: function (type) {
          //, isSyncAction) {
          type = handleType(type);

          // if (typeof isSyncAction !== 'undefined') {
          //   syncAction = isSyncAction;
          //}

          if (type == "audio") {
            stream.getAudioTracks().forEach(function (track) {
              track.enabled = false;
            });
          }

          if (type == "video") {
            stream.getVideoTracks().forEach(function (track) {
              track.enabled = false;
            });
          }
          video.muted = true;

          //if (typeof syncAction == 'undefined' || syncAction == true) {
          //   StreamsHandler.onSyncNeeded(stream.streamid, 'mute', type);
          //}

          //connection.streamEvents[stream.streamid].muteType = type || 'both';

          //fireEvent(stream, 'mute', type);
        },
        onUnMuted: function (type) {
          //, isSyncAction) {
          type = handleType(type);

          //if (typeof isSyncAction !== 'undefined') {
          //     syncAction = isSyncAction;
          // }

          //graduallyIncreaseVolume();

          if (type == "audio") {
            stream.getAudioTracks().forEach(function (track) {
              track.enabled = true;
            });
          }

          if (type == "video") {
            stream.getVideoTracks().forEach(function (track) {
              track.enabled = true;
            });

            // make sure that video unmute doesn't affects audio
            /*if (typeof type !== 'undefined' && type == 'video' && connection.streamEvents[stream.streamid].isAudioMuted) {
                    (function looper(times) {
                        if (!times) {
                            times = 0;
                        }

                        times++;

                        // check until five-seconds
                        if (times < 100 && connection.streamEvents[stream.streamid].isAudioMuted) {
                            stream.mute('audio');

                            setTimeout(function() {
                                looper(times);
                            }, 50);
                        }
                    })();
                }*/
          }
          video.muted = true;
          //if (typeof syncAction == 'undefined' || syncAction == true) {
          //  StreamsHandler.onSyncNeeded(stream.streamid, 'unmute', type);
          //}

          //connection.streamEvents[stream.streamid].unmuteType = type || 'both';

          //fireEvent(stream, 'unmute', type);
        },
      });
      //mediaElement.controls=true;
      mediaElement.toggle("mute-audio");
      mediaElement.toggle("mute-audio");
      mymediaelement = stream;
      if (ishost) {
        videosContainer.appendChild(mediaElement);
        var audioTrack = stream.getAudioTracks();
        audiostreams.push(...audioTrack);
      } else {
        var videoc = document.getElementById("invideo");
        videoc.appendChild(mediaElement);
      }
      if (videolist == null) {
        videolist = [];
      }

      clientvideo = video;
      clientstream = stream;

      callback && callback();
    },
    onerror: function () {
      alert("unable to get access to your webcam");
      callback && callback();
    },
  });
}
var resetCanvas = [];
var reset = false;
var reset2 = false;
function loopMain() {
  if (videolist != null) {
    if (videolist.length > 0) {
      //var pn=can1.parentNode;
      //pn.removeChild(can1);
      //var can = document.createElement('canvas');
      //can.setAttribute('id', 'canvasMain');
      //can.setAttribute('style','visibility:hidden');
      //pn.appendChild(can);

      var ctx = can.getContext("2d");
      var x = videolist.length;
      //alert(x);
      if (x > 1) reset = true;

      //for(var i=0;i<x;i++){
      //var video1=videolist[i];
      //video1.removeEventListener('playing',binderfunc);

      //}

      var w = can.width;
      let h = can.height;
      if (x > 1) w /= x;
      //reset=false;
      for (var i = 0; i < x; i++) {
        var video1 = videolist[i];
        if (x > 1 && i == 0)
          video1.onplaying = binderfunc(video1, ctx, i, w, true, h);
        //video1.addEventListener('playing', update, 0);
        else video1.onplaying = binderfunc(video1, ctx, i, w, false, h);
      } /*
if(window.stream==null)
{

for(var i=0;i<audiostreams.length;i++)
mainstream.addTrack(audiostreams[i]);
window.stream=mainstream;
audiostreamscount=audiostreams.length;
}
else
{
*/
      for (var i = 0; i < audiostreams.length; i++) {
        audiostreams[i].enabled = true;
        mainstream.addTrack(audiostreams[i]);
      }
      window.stream = mainstream;
      try {
        mediaRecorder.start();
      } catch (err) {
        console.log(err);
      }
      if (audiostreams.length > audiostreamscount)
        audiostreamscount = audiostreams.length;
      //}
    }
  }
}

function update() {
  // html2canvas(document.getElementById("videos-container"), {
  //   allowTaint: true,
  //   foreignObjectRendering: true,
  //   onrendered: function (canvas) {
  //     let img = Canvas2Image.convertToImage(canvas, canvas.width, canvas.height);
  //     var con = document.getElementById("canvasMain");
  //     var ctx = con.getContext("2d");
  //     ctx.drawImage(img, 0, 0, img.width, img.height);
  //   },
  // });
  // setTimeout(update, 1000 / 30);
  //requestAnimationFrame(update);
}

function binderfunc(video1, ctx, i, w, b, h) {
  var $this = video1; //cache
  //var $ctx=ctx;
  //var $i=i;
  //var $w=w;
  (function loop() {
    if (!$this.ended && !reset) {
      if (!b) ctx.drawImage($this, i * w, 0, w, (3 * w) / 4);
      else {
        var rem = h - (3 * w) / 4;
        ctx.drawImage($this, 0, (3 * w) / 4, can.width, rem);
      }
      let r = setTimeout(loop, 5); // drawing at 60fps
      resetCanvas.push(r);
    } else if (reset == true) {
      //ctx.beginPath();

      for (var i1 = 0; i1 < resetCanvas.length; i1++) {
        clearTimeout(resetCanvas[i1]);
        // cancelAnimationFrame(resetCanvas[i]);
      }
      ctx.clearRect(0, 0, can.width, can.height);

      ctx.canvas.width = ctx.canvas.width;
      ctx.canvas.height = ctx.canvas.height;
      reset = false;
      //b=false;
      //loopMain();
      let r = setTimeout(loop, 5); // drawing at 30fps
      resetCanvas.push(r);
    }
  })();
}

/* UI specific */
var videosContainer; // =
// document.getElementById("videos-container") || document.body;
var btnSetupNewRoom; // = document.getElementById("setup-new-room");
var roomsList; // = document.getElementById("rooms-list");

// if (btnSetupNewRoom) btnSetupNewRoom.onClick = setupNewRoomButtonClickHandler;

function rotateVideo(video) {
  video.style[navigator.mozGetUserMedia ? "transform" : "-webkit-transform"] =
    "rotate(0deg)";
  setTimeout(function () {
    video.style[navigator.mozGetUserMedia ? "transform" : "-webkit-transform"] =
      "rotate(360deg)";
  }, 1000);
}

let initiateUniqueTokenLink = function () {
  var uniqueToken = document.getElementById("unique-token");
  if (uniqueToken)
    if (window.location.hash.length > 2)
      uniqueToken.parentNode.parentNode.parentNode.innerHTML =
        '<h2 style="text-align:center;display: block;"><a href="' +
        window.location.href +
        '" target="_blank">Right click to copy & share this private link</a></h2>';
    else
      uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href =
        "#" +
        (Math.random() * new Date().getTime())
          .toString(36)
          .toUpperCase()
          .replace(/\./g, "-");
};

// function scaleVideos() {
//   var videos = document.querySelectorAll("video"),
//     length = videos.length,
//     video;

//   var minus = 130;
//   var windowHeight = 700;
//   var windowWidth = 600;
//   var windowAspectRatio = windowWidth / windowHeight;
//   var videoAspectRatio = 4 / 3;
//   var blockAspectRatio;
//   var tempVideoWidth = 0;
//   var maxVideoWidth = 0;

//   for (var i = length; i > 0; i--) {
//     blockAspectRatio = (i * videoAspectRatio) / Math.ceil(length / i);
//     if (blockAspectRatio <= windowAspectRatio) {
//       tempVideoWidth =
//         (videoAspectRatio * windowHeight) / Math.ceil(length / i);
//     } else {
//       tempVideoWidth = windowWidth / i;
//     }
//     if (tempVideoWidth > maxVideoWidth) maxVideoWidth = tempVideoWidth;
//   }
//   for (var i = 0; i < length; i++) {
//     video = videos[i];
//     if (video) video.width = maxVideoWidth - minus;
//   }
// }

function binderfuncshare(ctx) {
  //var $this = sharevideo; //cache
  //alert('hi');
  //var $ctx=ctx;
  //var $i=i;
  //var $w=w;

  var canvasHost = document.getElementById("canvasHost");
  var ctx = canvasHost.getContext("2d");
  var w = 100;
  if (!hostvideo.ended && !reset2) {
    if (sharevideo == null) ctx.drawImage(hostvideo, 0, 0, 150, 180);
    else {
      ctx.drawImage(hostvideo, 0, 0, 150, 180);
      ctx.drawImage(sharevideo, 151, 0, 150, 180);
      //ctx.drawImage(hostvideo,0,0,50,50);
      //ctx.drawImage(sharevideo,50,0,w*3-50,w*3-50);
    }
    if (sharevideo) {
      if (shared) {
        shared = false;
        alert(w);
        reset2 = true;
      }
      if (sharevideo.ended) {
        alert("off1");
        sharevideo = null;
        reset2 = true;
      }
    } else if (shared) {
      shared = false;
      alert(w);
      reset2 = true;
      loopMain();
    }

    setTimeout(binderfuncshare, 2); // drawing at 30fps
    //resetCanvas.push(r);
  } else if (reset2) {
    ctx.clearRect(0, 0, 300, 180);

    ctx.canvas.width = 300;
    ctx.canvas.height = 180;
    reset2 = false;
    setTimeout(binderfuncshare, 2); // drawing at 30fps
  }
}
function endedShare() {
  reset = true;
  loopMain();
  reset2 = true;
}
// var share = document.getElementById("share");
// share.addEventListener("click", () => {
//var resolutions = {};

//resolutions.maxWidth = 853;
//resolutions.maxHeight = 480;

//desktop_id = chrome.desktopCapture.chooseDesktopMedia(sources, function(chromeMediaSourceId, opts) {
//      opts = opts || {};
//    opts.resolutions = resolutions;
//  onAccessApproved(chromeMediaSourceId, opts);
//});
let shareClick = function () {
  navigator.mediaDevices
    .getDisplayMedia({ audio: false, video: { cursor: "always" } })
    .then((stream) => {
      var video = document.createElement("video");
      video.volume = 1;
      video.srcObject = stream;
      var mediaElement = window.getMediaElement(video, {
        width: videosContainer.clientWidth / 2 - 50,
        buttons: ["mute-video", "mute-audio", "volume-slider", "stop"],
      });
      //conferenceUI.addStream(stream);

      videolist.splice(0, 0, video);
      mediaElement.toggle("mute-video");
      mediaElement.toggle("mute-video");
      videosContainer.appendChild(mediaElement);
      reset2 = true;
      reset = true;
      sharevideo = video;
      stream.getVideoTracks()[0].onended = function () {
        videosContainer.removeChild(mediaElement);
        videolist.splice(0, 1);
        endedShare();
      };

      //videolist.push(sharevideo);
      loopMain();
      //var audioTrack = stream.getAudioTracks()[0];
      //if(audioTrack!=null)
      //audiostreams.splice(1,0,audioTrack);
      //var canvasHost=document.getElementById('canvasHost');
      //var ctx=canvasHost.getContext('2d');
    })
    .catch((handleError) => alert(handleError));
};
function handleType(type) {
  if (!type) {
    return;
  }

  if (typeof type === "string" || typeof type === "undefined") {
    return type;
  }

  if (type.audio && type.video) {
    return null;
  }

  if (type.audio) {
    return "audio";
  }

  if (type.video) {
    return "video";
  }

  return;
}

// window.onresize = scaleVideos;
loopMain();

function muteall() {
  if (ishost) {
    conferenceUI.muteall();
  }
}
function unmuteall() {
  if (ishost) conferenceUI.unmuteall();
}

import React, { useState, useEffect, useRef, useContext } from "react";
import io from "socket.io-client";
import { ChatContext } from "../context/ChatContext";
import VideoPlayer from "../components/VideoPlayer";
import Chat from "../components/Chat";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";

import { checkIfYoutubeVideoLink } from "../shared/functions";
import { setVideoLinkAction, setRoomIDAction } from "../actions/actions";

function Room(props) {
  const { state, dispatch } = useContext(ChatContext);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [hostUsername, setHostUsername] = useState("");
  const [room, setRoom] = useState([]);
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);
  const youtubePlayer = useRef(null);
  const previousTime = useRef(0);
  const currentPlaybackRate = useRef(1);

  // used to sync user with host on component mount
  const notHost = useRef(false);

  const loadVideoContainer = useRef(null);
  const hostControlBtn = useRef(null);
  const host = useRef(null);
  const selfUserObj = useRef(null);
  const sendMsgBtn = useRef(null);
  const videoID = useRef("");

  const ENDPOINT = "https://youtube-2gether-backend.herokuapp.com/";
  //   const ENDPOINT = "http://localhost:8000";

  useEffect(() => {
    setLoading(true);

    const roomID = props.match.params.roomID;

    if (!state.username) {
      dispatch(setRoomIDAction(roomID));
      return props.history.push("/join-room/");
    }

    socketRef.current = io.connect(ENDPOINT);

    socketRef.current.emit(
      "join room",
      props.match.params.roomID,
      state.username
    );

    socketRef.current.on("self user obj", (userObj) => {
      setLoading(false);
      selfUserObj.current = userObj;
    });

    socketRef.current.on("room", (socketRoom) => {
      setRoom(socketRoom);
    });

    socketRef.current.on("host", (hostObj) => {
      host.current = hostObj;
      if (state.videoLink) {
        videoID.current = extractVideoID(state.videoLink);
      } else {
        videoID.current = extractVideoID(getLastViewedVideoLink());
      }
      createVideoPlayer();
      setHostUsername(host.current.username);
    });

    socketRef.current.on("not host", (hostObj) => {
      if (host.current) {
        return socketRef.current.emit("current video id", videoID.current);
      }
      host.current = hostObj;
      setHostUsername(host.current.username);
      notHost.current = true;
      hostControlBtn.current.style.display = "block";
    });

    socketRef.current.on("host video id", (hostVideoID) => {
      videoID.current = hostVideoID;
      createVideoPlayer();
    });

    socketRef.current.on("message", (messageObj) => {
      receivedMessage(messageObj);
    });

    socketRef.current.on("load", (videoLinkData) => {
      saveLastViewedVideo(videoLinkData);
      videoID.current = extractVideoID(videoLinkData);
      loadYTVideo();
    });

    socketRef.current.on("seek", (t) => {
      seekYTVideo(t);
    });

    socketRef.current.on("status", (status) => {
      if (status === window.YT.PlayerState.PLAYING) {
        youtubePlayer.current.playVideo();
      } else {
        youtubePlayer.current.pauseVideo();
      }
    });

    socketRef.current.on("new host", (newHostObj) => {
      host.current = newHostObj;
      setHostUsername(newHostObj.username);
      if (selfUserObj.current.id !== host.current.id) {
        loadVideoContainer.current.style.display = "none";
        hostControlBtn.current.style.display = "block";
      }
    });

    socketRef.current.on("playback", (changeRate) => {
      changePlaybackRate(changeRate);
    });

    return () => {
      //youtube widget
      const firstScriptTag = document.getElementsByTagName("script")[0];
      //youtube iframe
      const secondScriptTag = document.getElementsByTagName("script")[1];
      if (firstScriptTag) firstScriptTag.remove();
      if (secondScriptTag) secondScriptTag.remove();
      socketRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (room.length === 0) return;
    randomChangeHost();
  }, [room]);

  function saveLastViewedVideo(videoLink = state.videoLink) {
    localStorage.setItem("lastViewedVideo", videoLink);
  }

  function getLastViewedVideoLink() {
    return localStorage.getItem("lastViewedVideo");
  }

  function createVideoPlayer() {
    if (!window.onYouTubeIframeAPIReady) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = loadVideoPlayer;
    } else {
      loadVideoPlayer();
    }
  }

  function loadVideoPlayer() {
    const player = new window.YT.Player("player", {
      height: "450",
      width: "800",
      videoId: videoID.current,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onPlaybackRateChange: onPlayerPlaybackRateChange,
      },
    });
    youtubePlayer.current = player;
  }

  function onPlayerPlaybackRateChange(e) {
    if (host.current.id !== selfUserObj.current.id) return;

    const newPlaybackRate = e.data;
    if (newPlaybackRate === currentPlaybackRate.current) return;
    currentPlaybackRate.current = newPlaybackRate;
    initPlaybackChange(e.data);
  }

  function getCurrentVideoTime() {
    return youtubePlayer.current.getCurrentTime();
  }

  function getCurrentPlayerState() {
    return youtubePlayer.current.getPlayerState();
  }

  function extractVideoID(videoLinkData) {
    const videoIDStr = videoLinkData.split("v=")[1];
    return videoIDStr.substring(0, 11);
  }

  function resetNotHostVal() {
    if (notHost.current) notHost.current = false;
  }

  function onPlayerReady(e) {
    console.log("player ready");
    setLoading(false);

    if (host.current.id === selfUserObj.current.id) {
      displayLoadVideoInput();
    }

    currentPlaybackRate.current = youtubePlayer.current.getPlaybackRate();

    if (host.current && host.current.id === selfUserObj.current.id) {
      setInterval(() => {
        const currentVideoTime = getCurrentVideoTime();
        const currentPlayerState = getCurrentPlayerState();
        socketRef.current.emit(
          "host time",
          currentVideoTime,
          currentPlayerState
        );
      }, 1000);
    }
    socketRef.current.on("time", (t, playerState) => {
      if (notHost.current) {
        if (playerState === 5) {
          console.log("video cued");
        } else if (playerState === 2) {
          console.log("video paused");
          youtubePlayer.current.seekTo(t);
          youtubePlayer.current.pauseVideo();
        } else {
          console.log("other player state");
          youtubePlayer.current.seekTo(t);
        }
      }
      resetNotHostVal();
    });
  }

  function onPlayerStateChange(e) {
    if (host.current.id !== selfUserObj.current.id) return;
    const playerState = window.YT.PlayerState;

    switch (e.data) {
      case playerState.UNSTARTED:
        console.log("unstarted");
        break;
      case playerState.ENDED:
        console.log("ended");
        break;
      case playerState.PLAYING:
        checkIfSeek();
        socketRef.current.emit("player status", e.data);
        break;
      case playerState.PAUSED:
        socketRef.current.emit("player status", e.data);
        break;
      case playerState.BUFFERING:
        console.log("buffering");
        break;
      case playerState.CUED:
        console.log("video cued");
        break;
      default:
        console.log("unexpected event");
    }
  }

  function checkIfSeek() {
    const currentVideoTime = getCurrentVideoTime();
    // if more than one 1sec
    if (Math.abs(previousTime.current - currentVideoTime) > 1) {
      socketRef.current.emit("seek video", currentVideoTime);
      previousTime.current = currentVideoTime;
    }
  }

  function seekYTVideo(t) {
    youtubePlayer.current.seekTo(t);
  }

  function initLoadVideo() {
    if (!videoLink) return;

    const isYoutubeVideoLink = checkIfYoutubeVideoLink(videoLink);
    if (!isYoutubeVideoLink)
      return alert("Please eneter a valid Youtube video link.");

    dispatch(setVideoLinkAction(videoLink));
    socketRef.current.emit("load video", videoLink);
  }

  function loadYTVideo() {
    youtubePlayer.current.loadVideoById(videoID.current);
    setVideoLink("");
  }

  function initPlaybackChange(changeRate) {
    socketRef.current.emit("change playback", changeRate);
  }

  function changePlaybackRate(changeRate) {
    youtubePlayer.current.setPlaybackRate(changeRate);
  }

  function receivedMessage(messageObj) {
    setMessages((oldMsgs) => [...oldMsgs, messageObj]);
  }

  function sendMessage(e) {
    e.preventDefault();

    if (!message.trim()) return;

    const messageObject = {
      body: message,
      id: selfUserObj.current.id,
      author: selfUserObj.current.username,
    };
    setMessage("");
    socketRef.current.emit("send message", messageObject);
    sendMsgBtn.current.style.backgroundColor = "#b3acad";
  }

  function handleMessageChange(e) {
    const msgInputVal = e.target.value.trim();

    if (msgInputVal) {
      sendMsgBtn.current.style.backgroundColor = "#EF476F";
      sendMsgBtn.current.style.cursor = "pointer";
    } else {
      sendMsgBtn.current.style.cursor = "auto";
      sendMsgBtn.current.style.backgroundColor = "#b3acad";
    }
    setMessage(msgInputVal);
  }

  function displayLoadVideoInput() {
    loadVideoContainer.current.style.display = "flex";
    hostControlBtn.current.style.display = "none";
  }

  function randomChangeHost() {
    const hostObj = room.find((userObj) => userObj.id === host.current.id);
    if (!hostObj) {
      const newHostObj = room[Math.floor(Math.random() * room.length)];
      socketRef.current.emit("host change", newHostObj);
      displayLoadVideoInput();
    }
  }

  function changeHost() {
    const newHostObj = room.find(
      (userObj) => userObj.id === selfUserObj.current.id
    );
    socketRef.current.emit("host change", newHostObj);
    displayLoadVideoInput();
  }

  return (
    <div className="main-container">
      {!loading ? (
        <>
          <VideoPlayer
            setVideoLink={setVideoLink}
            forwardedRefHostControlBtn={hostControlBtn}
            forwardedRefLoadContainer={loadVideoContainer}
            initLoadVideo={initLoadVideo}
            videoLink={videoLink}
            changeHost={changeHost}
            hostUsername={hostUsername}
          />

          <Chat
            room={room}
            messages={messages}
            message={message}
            sendMessage={sendMessage}
            handleMessageChange={handleMessageChange}
            forwardedRefSendMsgBtn={sendMsgBtn}
            selfUserObj={selfUserObj}
          />
        </>
      ) : (
        <Loader type="ThreeDots" color="#fff" height={100} width={100} />
      )}
    </div>
  );
}

export default Room;

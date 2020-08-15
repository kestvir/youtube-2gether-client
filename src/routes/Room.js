import React, { useState, useEffect, useRef, useContext } from "react";
import io from "socket.io-client";
import { ChatContext } from "../context/ChatContext";
import VideoPlayer from "../components/VideoPlayer";
import Chat from "../components/Chat";

const Room = (props) => {
    const { state, dispatch } = useContext(ChatContext);

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [videoLink, setVideoLink] = useState("");
    const [hostUsername, setHostUsername] = useState("");
    const [room, setRoom] = useState([]);

    const socketRef = useRef(null);
    const youtubePlayer = useRef(null);
    const previousTime = useRef(0);
    const currentPlaybackRate = useRef(1);
    const notHost = useRef(false);
    const loadVideoContainer = useRef(null);
    const hostControlBtn = useRef(null);
    const host = useRef(null);
    const yourUserObj = useRef(null);
    const sendMsgBtn = useRef(null);
    const videoID = useRef("");

    useEffect(() => {
        const roomID = props.match.params.roomID;

        if (!state.username) {
            dispatch({ type: 'SET_ROOM_ID', chat: { roomID } });
            return props.history.push("/join-room/");
        }

        socketRef.current = io.connect('/');

        socketRef.current.emit("join room", props.match.params.roomID, state.username);

        socketRef.current.on("diconnect", () => {
            socketRef.current.close();
        })

        socketRef.current.on("room", socketRoom => {
            setRoom(socketRoom);
        })

        socketRef.current.on("host", hostObj => {
            host.current = hostObj;
            videoID.current = state.videoLink.split("=")[1];
            createVideoPlayer()
            setHostUsername(host.current.username)
            loadVideoContainer.current.style.display = "flex";
            hostControlBtn.current.style.display = "none";
        })

        socketRef.current.on("not host", hostObj => {
            if (host.current) {
                socketRef.current.emit("current video id", videoID.current);
                return
            }
            host.current = hostObj;
            setHostUsername(host.current.username)
            notHost.current = true;
        })

        socketRef.current.on("host video id", hostVideoID => {
            videoID.current = hostVideoID;
            createVideoPlayer();
        })

        socketRef.current.on("your user obj", userObj => {
            yourUserObj.current = userObj;
        })


        socketRef.current.on("message", messageObj => {
            receivedMessage(messageObj);
        })

        socketRef.current.on("load", videoLinkData => {
            videoID.current = videoLinkData.split("=")[1]
            loadYTVideo();
        })

        socketRef.current.on("seek", t => {
            seekYTVideo(t);
        })

        socketRef.current.on("status", status => {
            if (status === window.YT.PlayerState.PLAYING) {
                youtubePlayer.current.playVideo();
            } else {
                youtubePlayer.current.pauseVideo();
            }
        })

        socketRef.current.on("new host", newHostObj => {
            host.current = newHostObj;
            setHostUsername(newHostObj.username)
            if (yourUserObj.current.id !== host.current.id) {
                loadVideoContainer.current.style.display = "none";
                hostControlBtn.current.style.display = "block";
            }
        })

        socketRef.current.on("playback", changeRate => {
            changePlaybackRate(changeRate)
        })

    }, []);


    useEffect(() => {
        console.log(room)
        if (room.length === 0) return
        randomChangeHost()
    }, [room])


    function createVideoPlayer() {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = loadVideoPlayer;
    }

    function loadVideoPlayer() {
        const player = new window.YT.Player('player', {
            height: '450',
            width: '800',
            videoId: videoID.current,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onPlaybackRateChange': onPlayerPlaybackRateChange
            }
        });
        youtubePlayer.current = player;
    }


    function onPlayerPlaybackRateChange(e) {
        if (host.current.id !== yourUserObj.current.id) return

        const newPlaybackRate = e.data;
        if (newPlaybackRate === currentPlaybackRate.current) return
        currentPlaybackRate.current = newPlaybackRate;
        initPlaybackChange(e.data);
    }

    function getCurrentVideoTime() {
        return youtubePlayer.current.getCurrentTime();
    }

    function getCurrentPlayerState() {
        return youtubePlayer.current.getPlayerState();
    }

    function resetNotHostVal() {
        if (notHost.current) notHost.current = false;
    }

    function onPlayerReady(e) {
        console.log("player ready")
        currentPlaybackRate.current = youtubePlayer.current.getPlaybackRate();
        const currentVideoTime = getCurrentVideoTime();
        const currentPlayerState = getCurrentPlayerState();

        if (host.current) {
            setInterval(() => {
                socketRef.current.emit("host time", currentVideoTime, currentPlayerState);
            }, 1000)
        }

        socketRef.current.on("time", (t, playerState) => {
            if (notHost.current) {
                if (playerState === 5) {
                    console.log('video cued')
                }
                else if (playerState === 2) {
                    console.log('video paused')
                    youtubePlayer.current.seekTo(t)
                    youtubePlayer.current.pauseVideo()
                } else {
                    console.log('other player state')
                    youtubePlayer.current.seekTo(t)
                }
            }
            resetNotHostVal();
        })
    }

    function onPlayerStateChange(e) {
        if (host.current.id !== yourUserObj.current.id) return

        switch (e.data) {
            case window.YT.PlayerState.UNSTARTED:
                console.log('unstarted');
                break;
            case window.YT.PlayerState.ENDED:
                console.log('ended');
                break;
            case window.YT.PlayerState.PLAYING:
                checkIfSeek()
                socketRef.current.emit("player status", e.data)
                break;
            case window.YT.PlayerState.PAUSED:
                socketRef.current.emit("player status", e.data)
                break;
            case window.YT.PlayerState.BUFFERING:
                console.log('buffering');
                break;
            case window.YT.PlayerState.CUED:
                console.log('video cued');
                break;
            default:
                console.log('unexpected event')
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
        if (!videoLink) return
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
        setMessages(oldMsgs => [...oldMsgs, messageObj]);
    }

    function sendMessage(e) {
        e.preventDefault();

        if (!message.trim()) return

        const messageObject = {
            body: message,
            id: yourUserObj.current.id,
            author: yourUserObj.current.username
        };
        setMessage("");
        socketRef.current.emit("send message", messageObject);
        sendMsgBtn.current.style.backgroundColor = "#b3acad";
    }

    function handleMessageChange(e) {
        const msgInputVal = e.target.value.trim();

        if (msgInputVal) {
            sendMsgBtn.current.style.backgroundColor = "#EF476F"
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
        const hostObj = room.find(userObj => userObj.id === host.current.id)
        if (!hostObj) {
            const newHostObj = room[Math.floor(Math.random() * room.length)];
            socketRef.current.emit("host change", newHostObj);
            displayLoadVideoInput();
        }
    }

    function changeHost() {
        const newHostObj = room.find(userObj => userObj.id === yourUserObj.current.id);
        socketRef.current.emit("host change", newHostObj);
        displayLoadVideoInput();
    }

    return (
        <div className="main-container">
            <VideoPlayer
                setVideoLink={setVideoLink}
                forwardedRefHostControlBtn={hostControlBtn}
                forwardedRefLoadContainer={loadVideoContainer}
                initLoadVideo={initLoadVideo}
                videoLink={videoLink}
                changeHost={changeHost}
                hostUsername={hostUsername} />

            <Chat
                room={room}
                messages={messages}
                message={message}
                sendMessage={sendMessage}
                handleMessageChange={handleMessageChange}
                forwardedRefSendMsgBtn={sendMsgBtn}
                yourUserObj={yourUserObj}
            />
        </div>
    );
};

export default Room;


import React, { useState, useContext, useEffect } from "react";
// import io from "socket.io-client";
import { v1 as uuid } from "uuid";
import { ChatContext } from "../context/ChatContext";

const CreateRoom = (props) => {
  const { state, dispatch } = useContext(ChatContext);

  const [username, setUsername] = useState("");
  const [videoLink, setVideoLink] = useState("");

  //   useEffect(() => {
  //     const username = state.username;

  //     if (username) {
  //       dispatch({ type: "SET_USERNAME", chat: { username: "" } });
  //     }
  //   }, []);

  function create(e) {
    e.preventDefault();

    if (!videoLink.trim() || !username.trim()) {
      return alert("Fill in the input fields!");
    }

    dispatch({ type: "SET_USERNAME", chat: { username } });
    dispatch({ type: "SET_VIDEOLINK", chat: { videoLink } });

    const roomID = uuid();

    dispatch({ type: "SET_ROOM_ID", chat: { roomID } });

    props.history.push(`/room/${roomID}`);
  }

  return (
    <div className="create-container">
      <form className="create-form">
        <input
          type="text"
          required
          placeholder="Youtube video link"
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
        />
        <input
          id="create-username-input"
          type="text"
          required
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value.trim())}
        />
        <button className="btn" type="submit" onClick={create}>
          Create Room
        </button>
      </form>
    </div>
  );
};

export default CreateRoom;

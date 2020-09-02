import React, { useState, useContext } from "react";
import { v1 as uuid } from "uuid";
import { ChatContext } from "../context/ChatContext";
import {
  setUsernameAction,
  setVideoLinkAction,
  setRoomIDAction,
} from "../actions/actions";

const CreateRoom = (props) => {
  const { dispatch } = useContext(ChatContext);

  const [username, setUsername] = useState("");
  const [videoLink, setVideoLink] = useState("");

  function create(e) {
    e.preventDefault();

    if (!videoLink.trim() || !username.trim()) {
      return alert("Fill in the input fields!");
    }

    dispatch(setUsernameAction(username));
    dispatch(setVideoLinkAction(videoLink));

    const roomID = uuid();

    dispatch(setRoomIDAction(roomID));

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

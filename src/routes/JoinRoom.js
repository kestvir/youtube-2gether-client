import React, { useContext, useState, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { setUsernameAction } from "../actions/actions";
import { BACKEND_ENDPOINT } from "../shared/constants";

function JoinRoom(props) {
  const { state, dispatch } = useContext(ChatContext);

  const [username, setUsername] = useState("");
  const [roomID, setRoomID] = useState("");

  useEffect(() => {
    setRoomID(state.roomID);
  }, [state.roomID]);

  async function checkIfRoomExists() {
    const response = await fetch(`${BACKEND_ENDPOINT}join-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomID }),
    });
    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }
    const data = await response.json();
    return data;
  }

  async function joinRoom(e) {
    e.preventDefault();

    if (!roomID.trim() || !username.trim()) {
      return alert("Fill in the input fields!");
    }
    const data = await checkIfRoomExists();

    if (!data.isRoom) return alert("Room does not exist!");

    dispatch(setUsernameAction(username));

    props.history.push(`/room/${roomID}`);
  }

  return (
    <div className="join-container">
      <form className="join-form" onSubmit={joinRoom}>
        <input
          type="text"
          required
          placeholder="Room ID"
          value={roomID}
          onChange={(e) => setRoomID(e.target.value)}
        />
        <input
          id="join-username-input"
          type="text"
          required
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value.trim())}
        />
        <button className="btn" type="submit">
          Join Room
        </button>
      </form>
    </div>
  );
}

export default JoinRoom;

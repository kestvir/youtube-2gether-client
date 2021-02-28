import React, { useContext, useState, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { setUsernameAction } from "../actions/actions";

function JoinRoom(props) {
  const { state, dispatch } = useContext(ChatContext);

  const [username, setUsername] = useState("");
  const [roomID, setRoomID] = useState("");

  useEffect(() => {
    if (state.roomID) {
      setRoomID(state.roomID);
    }
  }, []);

  function checkIfRoomExists(roomID) {
    fetch(`${process.env.REACT_APP_BACKEND_URL}join-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomID }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function joinRoom() {
    if (!roomID.trim() || !username.trim()) {
      return alert("Fill in the input fields!");
    }
    const roomExists = checkIfRoomExists(roomID);

    // if (!roomExists) return alert("Room does not exist!");

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

import React from "react";
import Avatar from "react-avatar";

function UserList({ room }) {
  return (
    <div className="user-list-container">
      <h2>Connected users:</h2>
      <div>
        {room.map((userObj) => {
          return (
            <Avatar
              size="40"
              round={true}
              key={userObj.id}
              name={userObj.username}
            />
          );
        })}
      </div>
    </div>
  );
}

export default UserList;

import React from "react";
import Avatar from "react-avatar";

const UserList = ({ room }) => {
  return (
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
  );
};

export default UserList;

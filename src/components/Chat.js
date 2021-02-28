import React from "react";
import UserList from "./UserList";
import Avatar from "react-avatar";

function Chat({
  room,
  messages,
  message,
  sendMessage,
  handleMessageChange,
  forwardedRefSendMsgBtn,
  yourUserObj,
}) {
  return (
    <div className="chat-container">
      <UserList room={room} />
      <div className="chat-messages-container">
        {messages.map((message, index) => {
          if (message.id === yourUserObj.current.id) {
            return (
              <div className="my-row" key={index}>
                <div className="my-message">
                  <span className="message-body">{message.body}</span>
                </div>
                <div className="avatar-container">
                  <Avatar
                    size="40"
                    round={true}
                    key={message.id}
                    name={message.author}
                  />
                </div>
              </div>
            );
          }
          return (
            <div className="partner-row" key={index}>
              <div className="avatar-container">
                <Avatar
                  size="40"
                  round={true}
                  key={message.id}
                  name={message.author}
                />
              </div>
              <div className="partner-message">
                <span className="message-body">{message.body}</span>
              </div>
            </div>
          );
        })}
      </div>
      <form className="chat-form" onSubmit={sendMessage}>
        <textarea
          className="chat-textarea"
          value={message}
          onChange={handleMessageChange}
          placeholder="Say something..."
        />
        <button type="submit" className="chat-btn" ref={forwardedRefSendMsgBtn}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;

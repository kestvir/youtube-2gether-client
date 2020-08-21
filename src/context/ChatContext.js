import React, { createContext, useReducer } from "react";
import { chatReducer } from "../reducers/chatReducer";

export const ChatContext = createContext();

const ChatContextProvider = (props) => {
  const [state, dispatch] = useReducer(chatReducer, {
    videoLink: "",
    roomID: "",
    username: "",
  });

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {props.children}
    </ChatContext.Provider>
  );
};

export default ChatContextProvider;

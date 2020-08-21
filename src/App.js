import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./routes/Home";
import CreateRoom from "./routes/CreateRoom";
import JoinRoom from "./routes/JoinRoom";
import Room from "./routes/Room";
import ChatContextProvider from "./context/ChatContext";

function App() {
  return (
    <div className="App">
      <ChatContextProvider>
        <BrowserRouter>
          <Navbar />
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/create-room" component={CreateRoom} />
            <Route path="/join-room/" component={JoinRoom} />
            <Route path="/room/:roomID" component={Room} />
          </Switch>
        </BrowserRouter>
      </ChatContextProvider>
    </div>
  );
}

export default App;

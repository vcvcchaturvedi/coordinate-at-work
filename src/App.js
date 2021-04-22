import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";
import { MainPanel } from "./concall.js";
// import socketIOClient from "socket.io-client";
// const ENDPOINT = "http://127.0.0.1:4001/";
// const socket = socketIOClient(ENDPOINT);
// let channel = (Math.random() * 100).toString().replace(".", "");
// let sender = Math.round(Math.random() * 999999999) + 999999999;
// socket.emit("new-channel", {
//   channel: channel,
//   sender: sender,
// });
// let mainsocket;
function App() {
  const [text, setText] = useState("");
  // useEffect(() => {
  //   mainsocket = socketIOClient(ENDPOINT + channel);
  //   mainsocket.send = function (message) {
  //     mainsocket.emit("message", {
  //       sender: sender,
  //       data: message,
  //     });
  //   };
  // }, []);
  // let clickHandler = function () {
  //   mainsocket.send(text);
  //   console.log(text);
  // };
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/* <input
          type="text"
          onChange={(e) => {
            setText(e.target.value);
          }}
        ></input> */}
        {/* <button onClick={clickHandler}>Click Me!</button> */}
        <MainPanel />
      </header>
    </div>
  );
}

export default App;

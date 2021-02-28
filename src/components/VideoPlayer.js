import React from "react";

function VideoPlayer({
  initLoadVideo,
  videoLink,
  setVideoLink,
  changeHost,
  hostUsername,
  forwardedRefLoadContainer,
  forwardedRefHostControlBtn,
}) {
  return (
    <div className="video-player-container">
      <h1 className="host-name">Current host: {hostUsername}</h1>
      <div id="player" />
      <button
        className="make-host-btn btn"
        ref={forwardedRefHostControlBtn}
        onClick={changeHost}
      >
        Make Me Host
      </button>
      <div ref={forwardedRefLoadContainer} id="load-video-container">
        <input
          type="text"
          placeholder="Video link"
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
        />
        <button className="btn" onClick={initLoadVideo}>
          Load video
        </button>
      </div>
    </div>
  );
}

export default VideoPlayer;

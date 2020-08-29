import React from "react";

const VideoPlayer = ({
  loading,
  initLoadVideo,
  videoLink,
  setVideoLink,
  changeHost,
  hostUsername,
  forwardedRefLoadContainer,
  forwardedRefHostControlBtn,
}) => {
  return (
    <div className="video-player-container">
      <h1 className="host-name">Current host: {hostUsername}</h1>
      <div id="player" />
      {!loading ? (
        <>
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
            <button
              style={{ marginTop: "1rem" }}
              className="btn"
              onClick={initLoadVideo}
            >
              Load video
            </button>
          </div>
        </>
      ) : (
        <h2 style={{ color: "white" }}>Loading...</h2>
      )}
    </div>
  );
};

export default VideoPlayer;

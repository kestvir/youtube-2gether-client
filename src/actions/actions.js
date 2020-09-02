export const setUsernameAction = (username) => {
  return { type: "SET_USERNAME", payload: username };
};

export const setVideoLinkAction = (videoLink) => {
  return { type: "SET_VIDEO_LINK", payload: videoLink };
};

export const setRoomIDAction = (roomID) => {
  return { type: "SET_ROOM_ID", payload: roomID };
};

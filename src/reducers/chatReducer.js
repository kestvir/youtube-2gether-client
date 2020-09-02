export const chatReducer = (state, action) => {
  switch (action.type) {
    case "SET_USERNAME":
      return {
        ...state,
        username: action.username,
      };
    case "SET_VIDEO_LINK":
      return {
        ...state,
        videoLink: action.videoLink,
      };
    case "SET_ROOM_ID":
      return {
        ...state,
        roomID: action.roomID,
      };
    default:
      return state;
  }
};

export const chatReducer = (state, action) => {
  switch (action.type) {
    case "SET_USERNAME":
      return {
        ...state,
        username: action.payload,
      };
    case "SET_VIDEO_LINK":
      return {
        ...state,
        videoLink: action.payload,
      };
    case "SET_ROOM_ID":
      return {
        ...state,
        roomID: action.payload,
      };
    default:
      return state;
  }
};

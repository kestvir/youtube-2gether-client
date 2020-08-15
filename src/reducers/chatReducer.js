export const chatReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USERNAME':
            return {
                ...state,
                username: action.chat.username,
            }
        case 'SET_VIDEOLINK':
            return {
                ...state,
                videoLink: action.chat.videoLink,
            }
        case 'SET_ROOM_ID':
            return {
                ...state,
                roomID: action.chat.roomID,
            }
        default:
            return state;
    }
}
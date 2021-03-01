import { BACKEND_ENDPOINT } from "./constants";

export function checkIfYoutubeVideoLink(input) {
  const validMatch = /^(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_]+)/;
  return validMatch.test(input);
}

export async function getRoomData(roomID) {
  const response = await fetch(`${BACKEND_ENDPOINT}join-room`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomID }),
  });
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  const data = await response.json();
  return data;
}

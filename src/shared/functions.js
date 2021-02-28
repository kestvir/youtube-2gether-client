export function checkIfYoutubeVideoLink(input) {
  const validMatch = /^(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_]+)/;
  return validMatch.test(input);
}

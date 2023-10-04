export const generateRequestId = function () {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const requestIdLength = 16;

  let requestId = "";
  for (let i = 0; i < requestIdLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    requestId += characters.charAt(randomIndex);
  }

  return requestId;
};

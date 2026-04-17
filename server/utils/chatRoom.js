const getDirectRoomId = (userA, userB) => {
  const [first, second] = [userA.toString(), userB.toString()].sort();
  return `direct:${first}:${second}`;
};

module.exports = {
  getDirectRoomId,
};
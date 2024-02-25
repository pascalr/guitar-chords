module.exports = (cmd) => {
  if (cmd === "build" || cmd === "b") {
    require("./build.js")();
  } else if (cmd === "server" || cmd === "s") {
    require("./server.js")();
  }
};

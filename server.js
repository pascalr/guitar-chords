const express = require("express");
const path = require("path");
const logger = require("morgan");
const { fileURLToPath } = require("url");
const fs = require("fs");
module.exports = (options) => {
  let port = options?.port || 3000;
  let songs = fs.readdirSync(path.join(__dirname, "data/chords"));
  (() => {
    let __chain = express();
    __chain.locals.locale = "en";
    __chain.locals.songs = songs;
    __chain.use(express.static("./docs"));
    __chain.use(express.static("./public"));
    return __chain.listen(port, function () {
      console.log(`Server listening on port ${port}`);
    });
  })();
};

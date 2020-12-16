const express = require("express");
const path = require("path");
const socket = require("./socket");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.use(express.static("public"));
app.listen(port, () => {
  console.log(`App started on port ${port}`);
});

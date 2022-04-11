require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");

const port = parseInt(process.env.PORT, 10) || 3000;

const routes = require("./routes");

const server = express();

server.use(
  cors({
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

server.use(compression());

routes(server);

server.listen(port, (err) => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});

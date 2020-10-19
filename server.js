const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");

const user = require("./routes/users");
const { connect } = require("./config/database");
dotenv.config({ path: "./config/config.env" });

const app = express();

// Connect DB
connect();

// Middlewares
app.use(express.json());
app.use(morgan("combined"));
app.use(cors());
app.use(helmet());

app.get("/", (req, res) => res.send("API working"));

app.use("/api/user", user);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`server is up and running on port ${PORT}`.cyan)
);

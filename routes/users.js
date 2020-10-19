const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const Users = require("../models/Users");

router.post("/login", async (req, res) => {
  const { name, password } = req.body;
  const user = await Users.findOne({
    where: {
      name,
    },
  });
  if (user == null) {
    return res.status(400).json({
      success: false,
      error: "User not found",
    });
  } else {
    try {
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(user.dataValues, process.env.jwt_secret, {
          expiresIn: "5 days", // For development purpose
          algorithm: "HS256",
        });
        res.status(200).json({
          success: true,
          message: "Login successful",
          token,
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Invalid credentials",
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
});

router.get("/", async (req, res) => {
  const result = await Users.findAll();
  res.status(200).json({
    success: true,
    count: result.length,
    data: result,
  });
});

router.get("/retrieve", async (req, res) => {
  const token = req.headers.authorization;
  if (!token)
    return res
      .status(400)
      .json({ success: false, error: "Authorization failed, token missing" });
  try {
    jwt.verify(token, process.env.jwt_secret, (err, payload) => {
      if (err) throw err;
      res.send(payload);
    });
  } catch (err) {
    console.error(err);
    if (err.message == "invalid token")
      res
        .status(401)
        .json({ success: false, error: "Authorization failed, invalid token" });
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const user = await Users.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (user != null) {
    return res.status(200).json({
      success: true,
      data: user,
    });
  } else {
    res.status(404).json({
      success: false,
      error: "User not found",
    });
  }
});

router.post(["/", "/register"], auth, async (req, res) => {
  const { name, age, password } = req.body;
  if (!name || !age || !password)
    return res.status(400).json({
      success: false,
      error: "Please include name, age and password",
    });
  let newUser = {
    name,
    age,
    password,
  };
  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(password, salt);
  try {
    newUser = await Users.create(newUser);
    res.status(201).json({
      success: true,
      message: "User added successfully",
      data: newUser,
    });
  } catch (err) {
    if (err.original.code == "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        error: "User already exits",
      });
    }
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

router.put("/:id", auth, async (req, res) => {
  const { name, age, password } = req.body;
  if (!name && !age && !password)
    return res.status(400).json({
      success: false,
      error: "Please include name or age or password",
    });
  const user = await Users.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (user != null) {
    await Users.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    const newUser = await Users.findOne({
      where: {
        id: req.params.id,
      },
    });
    return res.status(200).json({
      success: true,
      data: newUser,
    });
  } else {
    res.status(404).json({
      success: false,
      error: "User not found",
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  const user = await Users.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (user != null) {
    await Users.destroy({
      where: {
        id: req.params.id,
      },
    });
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } else {
    res.status(404).json({
      success: false,
      error: "User not found",
    });
  }
});

module.exports = router;
